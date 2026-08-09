from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
from auth.dependencies import require_role
from database import get_database
from datetime import datetime, timezone

router = APIRouter(prefix='/api/announcements', tags=['announcements'])


class AnnouncementBody(BaseModel):
    title: str
    message: str
    image_url: str = ''
    link_url: str = ''
    placement: str = 'home_top'  # home_top, home_sidebar, product_page, global_banner
    is_active: bool = True


@router.get('')
async def list_active(db=Depends(get_database)):
    docs = await db.announcements.find({'deleted_at': None, 'is_active': True}).sort('created_at', -1).to_list(length=50)
    for d in docs:
        d['id'] = str(d.pop('_id'))
    return docs


@router.get('/all')
async def list_all(
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    docs = await db.announcements.find({'deleted_at': None}).sort('created_at', -1).to_list(length=200)
    for d in docs:
        d['id'] = str(d.pop('_id'))
    return docs


@router.post('')
async def create(
    body: AnnouncementBody,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    now = datetime.now(timezone.utc)
    doc = body.model_dump()
    doc.update({'created_at': now, 'updated_at': now, 'deleted_at': None})
    r = await db.announcements.insert_one(doc)
    doc['id'] = str(r.inserted_id)
    doc.pop('_id', None)
    return doc


@router.put('/{ann_id}')
async def update(
    ann_id: str,
    body: AnnouncementBody,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    update = body.model_dump()
    update['updated_at'] = datetime.now(timezone.utc)
    r = await db.announcements.update_one({'_id': ObjectId(ann_id)}, {'$set': update})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail='Announcement not found')
    return {'message': 'updated'}


@router.delete('/{ann_id}')
async def delete(
    ann_id: str,
    current_user: dict = Depends(require_role('admin')),
    db=Depends(get_database),
):
    await db.announcements.update_one(
        {'_id': ObjectId(ann_id)},
        {'$set': {'deleted_at': datetime.now(timezone.utc), 'is_active': False}},
    )
    return {'message': 'deleted'}
