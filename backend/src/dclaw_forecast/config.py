from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "DClaw Forecast"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_forecast"
    cors_origins: str = "*"

    class Config:
        env_prefix = "FORECAST_"

settings = Settings()
