import cloudinary
import cloudinary.uploader
import asyncio
import logging
from config import settings

logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


class CloudinaryService:
    @staticmethod
    async def upload_file(file_bytes: bytes, folder: str = 'wibaza', resource_type: str = 'auto') -> dict:
        """Upload file bytes to Cloudinary. Returns dict with secure_url and public_id."""
        def _upload():
            return cloudinary.uploader.upload(
                file_bytes,
                folder=folder,
                resource_type=resource_type,
            )
        result = await asyncio.to_thread(_upload)
        logger.info(f"Uploaded to Cloudinary: {result.get('public_id')}")
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id'),
            'resource_type': result.get('resource_type'),
        }

    @staticmethod
    async def delete_file(public_id: str, resource_type: str = 'image') -> bool:
        def _delete():
            return cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        result = await asyncio.to_thread(_delete)
        return result.get('result') == 'ok'
