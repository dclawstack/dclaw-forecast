from pydantic import BaseModel
from datetime import datetime
from typing import List

class DemandForecast(BaseModel):
    id: str
    product_line: str
    horizon: str
    predicted_demand: int
    confidence_interval: dict
    seasonality_factor: str
    risk_adjustment: str
    created_at: datetime

class ForecastCreate(BaseModel):
    product_line: str
    horizon: str
