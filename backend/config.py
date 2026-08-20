import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    # MongoDB
    MONGO_URL: str = os.environ.get('MONGO_URL', '')
    DB_NAME: str = os.environ.get('DB_NAME', 'WIBAZA')
    
    # JWT
    JWT_SECRET: str = os.environ.get('JWT_SECRET', '')
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Admin
    ADMIN_EMAIL: str = os.environ.get('ADMIN_EMAIL', 'leamnse@gmail.com')
    ADMIN_PASSWORD: str = os.environ.get('ADMIN_PASSWORD', 'AdminWibaza1@#')
    
    # CORS
    CORS_ORIGINS: list = os.environ.get('CORS_ORIGINS', '*').split(',')
    FRONTEND_URL: str = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    
    # Stripe
    STRIPE_SECRET_KEY: str = os.environ.get('STRIPE_SECRET_KEY', '')
    STRIPE_PUBLISHABLE_KEY: str = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
    STRIPE_WEBHOOK_SECRET: str = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
    STRIPE_MODE: str = os.environ.get('STRIPE_MODE', '')
    
    # Resend
    RESEND_API_KEY: str = os.environ.get('RESEND_API_KEY', '')
    SENDER_EMAIL: str = os.environ.get('SENDER_EMAIL', 'noreply@wibaza.com')
    
    # OpenAI
    OPENAI_API_KEY: str = os.environ.get('OPENAI_API_KEY', '')
    
    # Integration Proxy
    INTEGRATION_PROXY_URL: str = os.environ.get('INTEGRATION_PROXY_URL', '')
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
    CLOUDINARY_API_KEY: str = os.environ.get('CLOUDINARY_API_KEY', '')
    CLOUDINARY_API_SECRET: str = os.environ.get('CLOUDINARY_API_SECRET', '')
    
    # Google OAuth (prepared - fill keys later)
    GOOGLE_CLIENT_ID: str = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET: str = os.environ.get('GOOGLE_CLIENT_SECRET', '')
    
    # Platform commission rate (0.10 = 10%)
    PLATFORM_COMMISSION_RATE: float = float(os.environ.get('PLATFORM_COMMISSION_RATE', '0.10'))

settings = Settings()
