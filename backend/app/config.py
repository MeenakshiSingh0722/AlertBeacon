from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AlertBeacon"
    SECRET_KEY: str = "default_secret_key"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    DEMO_MODE: bool = False
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./alertbeacon.db"
    POSTGRES_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/alertbeacon"
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20240620"
    
    MAPBOX_TOKEN: str = ""
    NOMINATIM_USER_AGENT: str = "AlertBeacon/1.0"
    
    SENDGRID_API_KEY: str = ""
    TWILIO_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
