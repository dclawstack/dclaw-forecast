from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.forecast_repo import DataSeriesRepository, ForecastRepository
from app.repositories.scenario_repo import ScenarioRepository
from app.schemas.dashboard import DashboardStats

router = APIRouter()


@router.get("", response_model=DashboardStats)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    series_repo = DataSeriesRepository(db)
    fc_repo = ForecastRepository(db)
    sc_repo = ScenarioRepository(db)

    total_series = await series_repo.count()
    total_forecasts = await fc_repo.count()
    total_scenarios = await sc_repo.count()
    completed = await fc_repo.count_completed()
    avg_mape = await fc_repo.avg_mape()
    recent = await fc_repo.recent(5)

    recent_out = [
        {
            "id": str(fc.id),
            "name": fc.name,
            "model_type": fc.model_type,
            "status": fc.status,
            "mape": fc.mape,
            "horizon_months": fc.horizon_months,
            "created_at": fc.created_at.isoformat(),
        }
        for fc in recent
    ]

    return DashboardStats(
        total_data_series=total_series,
        total_forecasts=total_forecasts,
        total_scenarios=total_scenarios,
        completed_forecasts=completed,
        avg_mape=round(avg_mape, 2) if avg_mape is not None else None,
        recent_forecasts=recent_out,
    )
