from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "DClaw Forecast"
    app_env: str = "dev"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_forecast"

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60

    # AI Copilot settings (optional)
    openai_api_key: str = ""
    ai_api_key: str = ""
    ai_endpoint: str = "https://api.openai.com/v1/chat/completions"
    ai_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
