from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_data_series: int
    total_forecasts: int
    total_scenarios: int
    completed_forecasts: int
    avg_mape: float | None
    recent_forecasts: list[dict]
