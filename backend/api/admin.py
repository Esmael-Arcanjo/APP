from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from typing import Optional
from auth.dependencies import require_role
from database import get_database
from services.email_service import EmailService
from config import settings
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/api/admin', tags=['admin'])


def _clean(doc: dict) -> dict:
    if '_id' in doc:
        doc['id'] = str(doc.pop('_id'))
    doc.pop('password_hash', None)
    return doc


@router.get('/stats')
async def get_stats(
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    """Get dashboard statistics"""
    total_users = await db.users.count_documents({'deleted_at': None})
    total_sellers = await db.users.count_documents({'role': 'seller', 'deleted_at': None})
    total_clients = await db.users.count_documents({'role': 'client', 'deleted_at': None})
    total_products = await db.products.count_documents({'deleted_at': None})
    total_orders = await db.orders.count_documents({'deleted_at': None})
    pending_products = await db.products.count_documents({'approval_status': 'pending', 'deleted_at': None})
    pending_sellers = await db.users.count_documents({'role': 'seller', 'is_approved': False, 'deleted_at': None})
    orders = await db.orders.find({'payment_status': 'paid', 'deleted_at': None}).to_list(length=10000)
    total_revenue = sum(order.get('total', 0) for order in orders)
    platform_commission = total_revenue * settings.PLATFORM_COMMISSION_RATE
    pending_commissions = await db.commissions.count_documents({'status': 'pending'}) if 'commissions' in await db.list_collection_names() else 0
    return {
        'total_users': total_users,
        'total_sellers': total_sellers,
        'total_clients': total_clients,
        'total_products': total_products,
        'total_orders': total_orders,
        'pending_products': pending_products,
        'pending_sellers': pending_sellers,
        'total_revenue': total_revenue,
        'platform_commission': platform_commission,
        'pending_commissions': pending_commissions,
    }


# -------- Users management --------
@router.get('/users')
async def get_users(
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    users = await db.users.find({'deleted_at': None}, {'password_hash': 0}).sort('created_at', -1).to_list(length=2000)
    return [_clean(u) for u in users]


@router.post('/users/{user_id}/ban')
async def ban_user(
    user_id: str,
    banned: bool = True,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    user = await db.users.find_one({'_id': ObjectId(user_id), 'deleted_at': None})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    if user.get('role') == 'admin':
        raise HTTPException(status_code=400, detail='Cannot ban admin')
    await db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'is_active': not banned, 'banned_at': datetime.now(timezone.utc) if banned else None, 'updated_at': datetime.now(timezone.utc)}}
    )
    return {'message': f'User {"banned" if banned else "unbanned"}'}


@router.delete('/users/{user_id}')
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    user = await db.users.find_one({'_id': ObjectId(user_id), 'deleted_at': None})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    if user.get('role') == 'admin':
        raise HTTPException(status_code=400, detail='Cannot delete admin')
    await db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'deleted_at': datetime.now(timezone.utc), 'is_active': False}}
    )
    return {'message': 'User deleted'}


@router.post('/sellers/{user_id}/approve')
async def approve_seller(
    user_id: str,
    approved: bool,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    user = await db.users.find_one({'_id': ObjectId(user_id), 'role': 'seller', 'deleted_at': None})
    if not user:
        raise HTTPException(status_code=404, detail='Seller not found')
    await db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'is_approved': approved, 'updated_at': datetime.now(timezone.utc)}}
    )
    try:
        await EmailService.send_seller_approval_email(user['email'], user['name'], approved)
    except Exception as e:
        logger.error(f'Failed to send approval email: {str(e)}')
    return {'message': f'Seller {"approved" if approved else "rejected"}'}


# -------- Products management --------
@router.get('/products')
async def get_all_products(
    status: Optional[str] = None,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    """Get all products with seller info (admin sees everything)"""
    q = {'deleted_at': None}
    if status:
        q['approval_status'] = status
    products = await db.products.find(q).sort('created_at', -1).to_list(length=2000)
    # attach seller info
    seller_ids = list({p['seller_id'] for p in products if p.get('seller_id')})
    sellers_map = {}
    if seller_ids:
        oids = []
        for sid in seller_ids:
            try:
                oids.append(ObjectId(sid))
            except Exception:
                pass
        cursor = db.users.find({'_id': {'$in': oids}}, {'name': 1, 'email': 1})
        async for s in cursor:
            sellers_map[str(s['_id'])] = {'name': s.get('name'), 'email': s.get('email')}
    for p in products:
        p['id'] = str(p.pop('_id'))
        sid = p.get('seller_id')
        p['seller'] = sellers_map.get(sid, {'name': 'Admin', 'email': ''}) if sid else {'name': 'Admin', 'email': ''}
    return products


@router.get('/products/pending')
async def get_pending_products(
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    return await get_all_products(status='pending', current_user=current_user, db=db)


@router.get('/stock')
async def get_stock_overview(
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    """Overview of all products stock"""
    products = await db.products.find({'deleted_at': None}, {'name': 1, 'stock': 1, 'seller_id': 1, 'price': 1, 'images': 1}).to_list(length=5000)
    seller_ids = list({p['seller_id'] for p in products if p.get('seller_id')})
    sellers_map = {}
    if seller_ids:
        oids = [ObjectId(s) for s in seller_ids if ObjectId.is_valid(s)]
        async for s in db.users.find({'_id': {'$in': oids}}, {'name': 1, 'email': 1}):
            sellers_map[str(s['_id'])] = {'name': s.get('name'), 'email': s.get('email')}
    for p in products:
        p['id'] = str(p.pop('_id'))
        p['seller'] = sellers_map.get(p.get('seller_id'), {'name': 'Admin', 'email': ''})
    return products


# -------- Payments & Commissions --------
@router.get('/payments')
async def list_payments(
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    """List all payment transactions"""
    txs = await db.payment_transactions.find({}).sort('created_at', -1).to_list(length=2000)
    for t in txs:
        t['id'] = str(t.pop('_id'))
    return txs


@router.get('/commissions')
async def list_commissions(
    status: Optional[str] = None,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    q = {}
    if status:
        q['status'] = status
    docs = await db.commissions.find(q).sort('created_at', -1).to_list(length=2000)
    for d in docs:
        d['id'] = str(d.pop('_id'))
    return docs


@router.post('/commissions/generate')
async def generate_commissions(
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    """Generate commission entries from paid orders that don't have one yet"""
    paid_orders = await db.orders.find({'payment_status': 'paid', 'deleted_at': None}).to_list(length=10000)
    created = 0
    for order in paid_orders:
        existing = await db.commissions.find_one({'order_id': str(order['_id'])})
        if existing:
            continue
        # Group by seller
        by_seller: dict = {}
        for item in order.get('items', []):
            sid = item.get('seller_id')
            if not sid:
                continue
            by_seller.setdefault(sid, 0.0)
            by_seller[sid] += float(item.get('total_price', 0))
        now = datetime.now(timezone.utc)
        for seller_id, gross in by_seller.items():
            commission = gross * settings.PLATFORM_COMMISSION_RATE
            payout = gross - commission
            await db.commissions.insert_one({
                'order_id': str(order['_id']),
                'order_number': order.get('order_number'),
                'seller_id': seller_id,
                'gross_amount': gross,
                'commission_amount': commission,
                'payout_amount': payout,
                'status': 'pending',  # pending | released | paid
                'released_at': None,
                'created_at': now,
                'updated_at': now,
            })
            created += 1
    return {'created': created}


@router.post('/commissions/{commission_id}/release')
async def release_commission(
    commission_id: str,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    """Release a commission (mark as paid to seller)"""
    r = await db.commissions.update_one(
        {'_id': ObjectId(commission_id), 'status': 'pending'},
        {'$set': {'status': 'released', 'released_at': datetime.now(timezone.utc), 'updated_at': datetime.now(timezone.utc)}}
    )
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail='Commission not found or already released')
    return {'message': 'released'}
