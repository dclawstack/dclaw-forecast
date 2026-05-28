import uuid
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict


class ScenarioBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_forecast_id: Optional[uuid.UUID] = None
    assumptions: Optional[dict[str, Any]] = None
    adjustment_pct: float = 0.0
    status: str = "draft"


class ScenarioCreate(ScenarioBase):
    pass


class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    assumptions: Optional[dict[str, Any]] = None
    adjustment_pct: Optional[float] = None
    status: Optional[str] = None


class ScenarioOut(ScenarioBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class PaginatedScenarios(BaseModel):
    items: list[ScenarioOut]
    total: int
    limit: int
    offset: int


class ScenarioResultOut(BaseModel):
    scenario: ScenarioOut
    adjusted_points: list[dict]
