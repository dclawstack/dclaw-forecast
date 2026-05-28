import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.scenario import Scenario
from app.repositories.scenario_repo import ScenarioRepository
from app.repositories.forecast_repo import ForecastRepository
from app.schemas.scenario import (
    ScenarioCreate, ScenarioUpdate, ScenarioOut, PaginatedScenarios, ScenarioResultOut
)

router = APIRouter()


@router.get("", response_model=PaginatedScenarios)
async def list_scenarios(limit: int = 20, offset: int = 0, db: AsyncSession = Depends(get_db)):
    repo = ScenarioRepository(db)
    items, total = await repo.list_all(limit=limit, offset=offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.post("", response_model=ScenarioOut, status_code=status.HTTP_201_CREATED)
async def create_scenario(body: ScenarioCreate, db: AsyncSession = Depends(get_db)):
    repo = ScenarioRepository(db)
    obj = Scenario(**body.model_dump())
    return await repo.create(obj)


@router.get("/{scenario_id}", response_model=ScenarioOut)
async def get_scenario(scenario_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ScenarioRepository(db)
    obj = await repo.get_by_id(scenario_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return obj


@router.patch("/{scenario_id}", response_model=ScenarioOut)
async def update_scenario(
    scenario_id: uuid.UUID, body: ScenarioUpdate, db: AsyncSession = Depends(get_db)
):
    repo = ScenarioRepository(db)
    obj = await repo.get_by_id(scenario_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return await repo.update(obj, body.model_dump(exclude_none=True))


@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scenario(scenario_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ScenarioRepository(db)
    obj = await repo.get_by_id(scenario_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Scenario not found")
    await repo.delete(obj)


@router.get("/{scenario_id}/result", response_model=ScenarioResultOut)
async def get_scenario_result(scenario_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Apply scenario adjustment_pct to the base forecast points."""
    sc_repo = ScenarioRepository(db)
    fc_repo = ForecastRepository(db)
    scenario = await sc_repo.get_by_id(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if not scenario.base_forecast_id:
        raise HTTPException(status_code=422, detail="Scenario has no base forecast")
    forecast = await fc_repo.get_by_id(scenario.base_forecast_id)
    if not forecast or forecast.status != "completed":
        raise HTTPException(status_code=422, detail="Base forecast not completed")

    multiplier = 1 + scenario.adjustment_pct / 100
    adjusted = [
        {
            "date": str(pt.date),
            "value": round(pt.value * multiplier, 4),
            "lower_bound": round(pt.lower_bound * multiplier, 4),
            "upper_bound": round(pt.upper_bound * multiplier, 4),
        }
        for pt in forecast.forecast_points
    ]
    return {"scenario": scenario, "adjusted_points": adjusted}
