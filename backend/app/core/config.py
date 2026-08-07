try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic.v1 import BaseSettings
    except ImportError:
        from pydantic import BaseModel as BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "HirePth"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://hirepth:hirepth@localhost:5432/hirepth"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_STARTER: str = ""
    STRIPE_PRICE_GROWTH: str = ""
    STRIPE_PRICE_ENTERPRISE: str = ""

    # Hetzner Object Storage (S3-compatible)
    S3_ENDPOINT_URL: str = "https://fsn1.your-objectstorage.com"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_BUCKET_NAME: str = "hirepth-docs"
    S3_REGION: str = "fsn1"

    # Email
    SMTP_HOST: str = "smtp.resend.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = "noreply@hirepth.lk"

    # OpenRouter LLM (Gemini Flash via LangChain)
    OPENROUTER_API_KEY: str = ""  # Set via OPENROUTER_API_KEY in .env
    OPENROUTER_MODEL: str = "google/gemini-2.5-flash-lite"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # WAHA WhatsApp API
    WAHA_BASE_URL: str = "http://178.104.127.220:3000"
    WAHA_SESSION: str = "hirepth"
    WAHA_API_KEY: str = "key_Z9s561T3AdkBlkciQ73wt7oag2yEurGA"

    # Supabase & Lovable AI Integration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    LOVABLE_API_KEY: str = ""
    LOVABLE_EDGE_FUNCTION_NAME: str = "lovable-whatsapp-agent"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://hirepth.lk",
        "https://www.hirepth.lk",
    ]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
