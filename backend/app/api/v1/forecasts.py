import uuid
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.forecast import Forecast
from app.repositories.forecast_repo import DataSeriesRepository, ForecastRepository
from app.schemas.forecast import (
    ForecastCreate, ForecastUpdate, ForecastOut, PaginatedForecasts, RunForecastRequest
)
from app.services import forecast_engine

router = APIRouter()


async def _run_forecast_task(forecast_id: uuid.UUID, series_id: uuid.UUID, model_type: str, horizon: int) -> None:
    """Background task to compute and store forecast points."""
    from app.core.database import get_db as _get_db
    from app.models.forecast import Forecast as ForecastModel
    async for db in _get_db():
        series_repo = DataSeriesRepository(db)
        fc_repo = ForecastRepository(db)
        fc = await fc_repo.get_by_id(forecast_id)
        if not fc:
            return
        await fc_repo.update(fc, {"status": "running"})
        try:
            points_raw = await series_repo.get_data_points(series_id)
            if not points_raw:
                await fc_repo.update(fc, {"status": "failed"})
                return
            values = [p.value for p in points_raw]
            last_date = max(p.date for p in points_raw)
            result = forecast_engine.run_forecast(values, last_date, model_type, horizon)
            await fc_repo.save_forecast_points(forecast_id, result["points"])
            await fc_repo.update(fc, {"status": "completed", "mape": result["mape"]})
        except Exception:
            await fc_repo.update(fc, {"status": "failed"})


@router.get("", response_model=PaginatedForecasts)
async def list_forecasts(limit: int = 20, offset: int = 0, db: AsyncSession = Depends(get_db)):
    repo = ForecastRepository(db)
    items, total = await repo.list_all(limit=limit, offset=offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.post("", response_model=ForecastOut, status_code=status.HTTP_201_CREATED)
async def create_forecast(body: ForecastCreate, db: AsyncSession = Depends(get_db)):
    repo = ForecastRepository(db)
    obj = Forecast(**body.model_dump())
    return await repo.create(obj)


@router.post("/run", response_model=ForecastOut, status_code=status.HTTP_201_CREATED)
async def run_forecast(
    body: RunForecastRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create and immediately run a forecast in the background."""
    series_repo = DataSeriesRepository(db)
    series = await series_repo.get_by_id(body.data_series_id)
    if not series:
        raise HTTPException(status_code=404, detail="Data series not found")

    model_type = body.model_type
    if model_type == "auto":
        points = await series_repo.get_data_points(body.data_series_id)
        values = [p.value for p in points]
        model_type = forecast_engine.select_best_model(values)

    name = body.name or f"{series.name} — {model_type} {body.horizon_months}m"
    fc_repo = ForecastRepository(db)
    obj = Forecast(
        data_series_id=body.data_series_id,
        name=name,
        model_type=model_type,
        horizon_months=body.horizon_months,
        status="pending",
    )
    fc = await fc_repo.create(obj)
    background_tasks.add_task(
        _run_forecast_task, fc.id, body.data_series_id, model_type, body.horizon_months
    )
    return fc


@router.get("/{forecast_id}", response_model=ForecastOut)
async def get_forecast(forecast_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ForecastRepository(db)
    obj = await repo.get_by_id(forecast_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return obj


@router.patch("/{forecast_id}", response_model=ForecastOut)
async def update_forecast(
    forecast_id: uuid.UUID, body: ForecastUpdate, db: AsyncSession = Depends(get_db)
):
    repo = ForecastRepository(db)
    obj = await repo.get_by_id(forecast_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return await repo.update(obj, body.model_dump(exclude_none=True))


@router.delete("/{forecast_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_forecast(forecast_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ForecastRepository(db)
    obj = await repo.get_by_id(forecast_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Forecast not found")
    await repo.delete(obj)
