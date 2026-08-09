from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
from auth.dependencies import require_role
from database import get_database
from datetime import datetime, timezone

router = APIRouter(prefix='/api/banners', tags=['banners'])


class BannerBody(BaseModel):
    title: str
    subtitle: str = ''
    image_url: str
    link_url: str = ''
    order: int = 0
    is_active: bool = True


@router.get('')
async def list_banners(db=Depends(get_database)):
    docs = await db.banners.find({'deleted_at': None, 'is_active': True}).sort('order', 1).to_list(length=100)
    for d in docs:
        d['id'] = str(d.pop('_id'))
    return docs


@router.get('/all')
async def list_all_banners(
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    docs = await db.banners.find({'deleted_at': None}).sort('order', 1).to_list(length=200)
    for d in docs:
        d['id'] = str(d.pop('_id'))
    return docs


@router.post('')
async def create_banner(
    body: BannerBody,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    now = datetime.now(timezone.utc)
    doc = body.model_dump()
    doc.update({'created_at': now, 'updated_at': now, 'deleted_at': None})
    result = await db.banners.insert_one(doc)
    doc['id'] = str(result.inserted_id)
    doc.pop('_id', None)
    return doc


@router.put('/{banner_id}')
async def update_banner(
    banner_id: str,
    body: BannerBody,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    update = body.model_dump()
    update['updated_at'] = datetime.now(timezone.utc)
    r = await db.banners.update_one({'_id': ObjectId(banner_id)}, {'$set': update})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail='Banner not found')
    return {'message': 'updated'}


@router.delete('/{banner_id}')
async def delete_banner(
    banner_id: str,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    await db.banners.update_one(
        {'_id': ObjectId(banner_id)},
        {'$set': {'deleted_at': datetime.now(timezone.utc), 'is_active': False}},
    )
    return {'message': 'deleted'}
