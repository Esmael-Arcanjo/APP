from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from auth.dependencies import get_current_user
from services.cloudinary_service import CloudinaryService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/api/uploads', tags=['uploads'])


@router.post('/image')
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload single image to Cloudinary (any authenticated user)."""
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail='Image too large (max 10MB)')
    folder = f"wibaza/{current_user['role']}s/{current_user['id']}"
    try:
        result = await CloudinaryService.upload_file(contents, folder=folder, resource_type='image')
        return result
    except Exception as e:
        logger.error(f'Upload failed: {str(e)}')
        raise HTTPException(status_code=500, detail='Upload failed')


@router.post('/images')
async def upload_images(
    files: list[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload multiple images."""
    folder = f"wibaza/{current_user['role']}s/{current_user['id']}"
    results = []
    for f in files:
        if not f.content_type or not f.content_type.startswith('image/'):
            continue
        contents = await f.read()
        if len(contents) > 10 * 1024 * 1024:
            continue
        try:
            r = await CloudinaryService.upload_file(contents, folder=folder, resource_type='image')
            results.append(r)
        except Exception as e:
            logger.error(f'Upload failed: {str(e)}')
    return {'uploads': results}
