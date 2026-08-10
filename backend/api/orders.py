from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from models.order import OrderCreate
from auth.dependencies import get_current_user
from database import get_database
from datetime import datetime, timezone
from services.email_service import EmailService
import secrets
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/api/orders', tags=['orders'])


@router.post('')
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    """Create new order. Server re-prices items from DB to prevent tampering."""
    if not order_data.items:
        raise HTTPException(status_code=400, detail='Order must have at least one item')

    # Re-price server-side and re-fetch seller_id from DB
    priced_items = []
    for it in order_data.items:
        try:
            oid = ObjectId(it.product_id)
        except Exception:
            raise HTTPException(status_code=400, detail=f'Invalid product id {it.product_id}')
        product = await db.products.find_one({'_id': oid, 'deleted_at': None, 'is_active': True, 'approval_status': 'approved'})
        if not product:
            raise HTTPException(status_code=400, detail=f'Product {it.product_id} not available')
        qty = int(it.quantity)
        if qty < 1:
            raise HTTPException(status_code=400, detail='Invalid quantity')
        if product.get('stock', 0) < qty:
            raise HTTPException(status_code=400, detail=f'Insufficient stock for {product["name"]}')
        unit_price = float(product.get('promotional_price') or product.get('price') or 0)
        total_price = round(unit_price * qty, 2)
        priced_items.append({
            'product_id': str(product['_id']),
            'product_name': product['name'],
            'seller_id': str(product['seller_id']),
            'quantity': qty,
            'unit_price': unit_price,
            'total_price': total_price,
        })

    subtotal = round(sum(i['total_price'] for i in priced_items), 2)
    order_number = f'ORD-{secrets.token_hex(4).upper()}'
    now = datetime.now(timezone.utc)
    order = {
        'order_number': order_number,
        'client_id': current_user['id'],
        'items': priced_items,
        'subtotal': subtotal,
        'tax': 0.0,
        'shipping': 0.0,
        'total': subtotal,
        'status': 'pending',
        'payment_status': 'pending',
        'payment_session_id': None,
        'shipping_address': order_data.shipping_address,
        'billing_address': order_data.billing_address,
        'created_at': now,
        'updated_at': now,
        'deleted_at': None,
    }
    result = await db.orders.insert_one(order)
    order['id'] = str(result.inserted_id)
    order.pop('_id', None)

    try:
        user = await db.users.find_one({'_id': ObjectId(current_user['id'])})
        if user:
            await EmailService.send_order_confirmation_email(user['email'], order_number, subtotal)
    except Exception as e:
        logger.error(f'Failed to send order confirmation email: {str(e)}')

    return order


@router.get('')
async def get_orders(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    query = {'deleted_at': None}
    if current_user['role'] == 'client':
        query['client_id'] = current_user['id']
    elif current_user['role'] == 'seller':
        query['items.seller_id'] = current_user['id']
    orders = await db.orders.find(query).sort('created_at', -1).to_list(length=200)
    for order in orders:
        if '_id' in order:
            order['id'] = str(order.pop('_id'))
    return orders


@router.get('/{order_id}')
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    order = await db.orders.find_one({'_id': ObjectId(order_id), 'deleted_at': None}, {'_id': 0})
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    if current_user['role'] == 'client' and order['client_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail='Not authorized')
    if current_user['role'] == 'seller':
        seller_items = [item for item in order['items'] if item['seller_id'] == current_user['id']]
        if not seller_items:
            raise HTTPException(status_code=403, detail='Not authorized')
    order['id'] = order_id
    return order
