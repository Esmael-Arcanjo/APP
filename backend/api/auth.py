from fastapi import APIRouter, Depends, HTTPException, Response, Request
from bson import ObjectId
from models.user import UserCreate, LoginRequest, PasswordResetRequest, PasswordResetConfirm
from services.user_service import UserService
from services.email_service import EmailService
from auth.jwt_utils import create_access_token, create_refresh_token, decode_token
from auth.dependencies import get_current_user
from database import get_database
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/api/auth', tags=['auth'])

@router.post('/register')
async def register(user_data: UserCreate, response: Response, db=Depends(get_database)):
    """Register new user"""
    try:
        user_service = UserService(db)
        user = await user_service.create_user(user_data)
        
        access_token = create_access_token(user['id'], user['email'], user['role'])
        refresh_token = create_refresh_token(user['id'])
        
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,
            samesite='lax',
            max_age=900,
            path='/'
        )
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='lax',
            max_age=604800,
            path='/'
        )
        
        try:
            await EmailService.send_welcome_email(user['email'], user['name'])
        except Exception as e:
            logger.error(f'Failed to send welcome email: {str(e)}')
        
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f'Registration error: {str(e)}')
        raise HTTPException(status_code=500, detail='Registration failed')

@router.post('/login')
async def login(login_data: LoginRequest, response: Response, db=Depends(get_database)):
    """Login user"""
    user_service = UserService(db)
    user = await user_service.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not user.get('is_active'):
        raise HTTPException(status_code=403, detail='Account is inactive')
    
    if user.get('role') == 'seller' and not user.get('is_approved'):
        raise HTTPException(status_code=403, detail='Seller account pending approval')
    
    access_token = create_access_token(user['id'], user['email'], user['role'])
    refresh_token = create_refresh_token(user['id'])
    
    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,
        secure=False,
        samesite='lax',
        max_age=900,
        path='/'
    )
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite='lax',
        max_age=604800,
        path='/'
    )
    
    return user

@router.post('/logout')
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    """Logout user"""
    response.delete_cookie(key='access_token', path='/')
    response.delete_cookie(key='refresh_token', path='/')
    return {'message': 'Logged out successfully'}

@router.get('/me')
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@router.post('/refresh')
async def refresh_token(request: Request, response: Response, db=Depends(get_database)):
    """Refresh access token"""
    refresh = request.cookies.get('refresh_token')
    
    if not refresh:
        raise HTTPException(status_code=401, detail='No refresh token')
    
    try:
        payload = decode_token(refresh)
        
        if payload.get('type') != 'refresh':
            raise HTTPException(status_code=401, detail='Invalid token type')
        
        user = await db.users.find_one({'_id': ObjectId(payload['sub']), 'deleted_at': None})
        
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        
        access_token = create_access_token(str(user['_id']), user['email'], user['role'])
        
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,
            samesite='lax',
            max_age=900,
            path='/'
        )
        
        return {'message': 'Token refreshed'}
    
    except Exception as e:
        raise HTTPException(status_code=401, detail='Invalid refresh token')

@router.post('/forgot-password')
async def forgot_password(request: PasswordResetRequest, db=Depends(get_database)):
    """Request password reset"""
    user_service = UserService(db)
    token = await user_service.create_password_reset_token(request.email)
    
    if token:
        try:
            await EmailService.send_password_reset_email(request.email, token)
        except Exception as e:
            logger.error(f'Failed to send reset email: {str(e)}')
    
    return {'message': 'If the email exists, a reset link has been sent'}

@router.post('/reset-password')
async def reset_password(request: PasswordResetConfirm, db=Depends(get_database)):
    """Reset password with token"""
    user_service = UserService(db)
    success = await user_service.reset_password(request.token, request.new_password)
    
    if not success:
        raise HTTPException(status_code=400, detail='Invalid or expired token')
    
    return {'message': 'Password reset successfully'}


# ---- Google OAuth (prepared - add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env to enable) ----
from pydantic import BaseModel

class GoogleAuthBody(BaseModel):
    id_token: str

@router.get('/google/config')
async def google_config():
    """Returns Google OAuth Client ID for frontend usage. Empty if not configured."""
    from config import settings
    return {
        'client_id': settings.GOOGLE_CLIENT_ID,
        'enabled': bool(settings.GOOGLE_CLIENT_ID),
    }

@router.post('/google')
async def google_signin(body: GoogleAuthBody, response: Response, db=Depends(get_database)):
    """Sign in / sign up with a Google ID token. Requires GOOGLE_CLIENT_ID configured."""
    from config import settings
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail='Google OAuth not configured. Set GOOGLE_CLIENT_ID in backend .env')
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
        info = google_id_token.verify_oauth2_token(body.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
    except Exception as e:
        logger.error(f'Google token verification failed: {e}')
        raise HTTPException(status_code=401, detail='Invalid Google token')

    email = info.get('email')
    name = info.get('name') or (email.split('@')[0] if email else 'User')
    avatar = info.get('picture')
    if not email:
        raise HTTPException(status_code=400, detail='Google account missing email')

    from datetime import datetime, timezone
    from auth.hash_utils import hash_password
    import secrets
    user = await db.users.find_one({'email': email, 'deleted_at': None})
    if not user:
        new_user = {
            'email': email,
            'password_hash': hash_password(secrets.token_urlsafe(32)),
            'name': name,
            'avatar_url': avatar,
            'role': 'client',
            'is_approved': True,
            'is_active': True,
            'oauth_provider': 'google',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
            'deleted_at': None,
        }
        r = await db.users.insert_one(new_user)
        new_user['id'] = str(r.inserted_id)
        new_user.pop('_id', None)
        new_user.pop('password_hash', None)
        user = new_user
    else:
        if not user.get('is_active'):
            raise HTTPException(status_code=403, detail='Account is inactive')
        user['id'] = str(user['_id'])
        user.pop('_id', None)
        user.pop('password_hash', None)

    access_token = create_access_token(user['id'], user['email'], user['role'])
    refresh = create_refresh_token(user['id'])
    response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='lax', max_age=900, path='/')
    response.set_cookie('refresh_token', refresh, httponly=True, secure=False, samesite='lax', max_age=604800, path='/')
    return user
