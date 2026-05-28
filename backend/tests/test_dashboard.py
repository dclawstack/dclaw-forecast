import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_empty(client: AsyncClient):
    resp = await client.get("/api/v1/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_data_series"] == 0
    assert data["total_forecasts"] == 0
    assert data["total_scenarios"] == 0
    assert data["completed_forecasts"] == 0
    assert data["avg_mape"] is None
    assert data["recent_forecasts"] == []


@pytest.mark.asyncio
async def test_dashboard_with_data(client: AsyncClient):
    await client.post("/api/v1/data-series", json={"name": "Sales"})
    await client.post("/api/v1/forecasts", json={"name": "Sales Q4"})
    await client.post("/api/v1/scenarios", json={"name": "Base"})
    resp = await client.get("/api/v1/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_data_series"] == 1
    assert data["total_forecasts"] == 1
    assert data["total_scenarios"] == 1
    assert len(data["recent_forecasts"]) == 1
