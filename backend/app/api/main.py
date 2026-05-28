from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import health
from app.api.v1 import data_series, forecasts, scenarios, ai, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(data_series.router, prefix="/api/v1/data-series", tags=["data-series"])
app.include_router(forecasts.router, prefix="/api/v1/forecasts", tags=["forecasts"])
app.include_router(scenarios.router, prefix="/api/v1/scenarios", tags=["scenarios"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
