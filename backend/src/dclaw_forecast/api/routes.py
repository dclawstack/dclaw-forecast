from fastapi import APIRouter
from datetime import datetime
from uuid import uuid4
import random
from dclaw_forecast.models import DemandForecast, ForecastCreate

router = APIRouter()

@router.post("/forecasts", response_model=DemandForecast)
async def create_item(payload: ForecastCreate):
    return DemandForecast(
        id=str(uuid4()),
        product_line=payload.product_line,
        horizon=payload.horizon,
        predicted_demand=random.randint(1000, 50000),
        confidence_interval={"lower": 0.9, "upper": 1.1},
        seasonality_factor="Summer peak +23%",
        risk_adjustment="-5% supply chain",
        created_at=datetime.utcnow(),
    )

@router.get("/forecasts/{forecast_id}/history")
async def get_item(forecast_id: str):
    return [{"month": "2024-11", "demand": 8500}, {"month": "2024-12", "demand": 9200}, {"month": "2025-01", "demand": 7800}, {"month": "2025-02", "demand": 8100}, {"month": "2025-03", "demand": 9500}, {"month": "2025-04", "demand": 10200}]
