import pytest
from httpx import AsyncClient


async def _create_series_with_points(client: AsyncClient, name: str = "Test Series") -> str:
    resp = await client.post("/api/v1/data-series", json={"name": name})
    series_id = resp.json()["id"]
    points = [{"date": f"2022-{m:02d}-01", "value": float(100 + m * 10)} for m in range(1, 13)]
    points += [{"date": f"2023-{m:02d}-01", "value": float(150 + m * 10)} for m in range(1, 13)]
    await client.post(f"/api/v1/data-series/{series_id}/points", json={"data_points": points})
    return series_id


@pytest.mark.asyncio
async def test_create_forecast(client: AsyncClient):
    resp = await client.post("/api/v1/forecasts", json={
        "name": "Q4 Forecast",
        "model_type": "linear",
        "horizon_months": 6,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Q4 Forecast"
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_list_forecasts(client: AsyncClient):
    await client.post("/api/v1/forecasts", json={"name": "Forecast 1", "model_type": "ets"})
    resp = await client.get("/api/v1/forecasts")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= 1


@pytest.mark.asyncio
async def test_get_forecast(client: AsyncClient):
    create_resp = await client.post("/api/v1/forecasts", json={"name": "Get Test"})
    fc_id = create_resp.json()["id"]
    resp = await client.get(f"/api/v1/forecasts/{fc_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == fc_id


@pytest.mark.asyncio
async def test_get_forecast_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/forecasts/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_forecast(client: AsyncClient):
    create_resp = await client.post("/api/v1/forecasts", json={"name": "Old Name"})
    fc_id = create_resp.json()["id"]
    resp = await client.patch(f"/api/v1/forecasts/{fc_id}", json={"name": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


@pytest.mark.asyncio
async def test_delete_forecast(client: AsyncClient):
    create_resp = await client.post("/api/v1/forecasts", json={"name": "Delete Me"})
    fc_id = create_resp.json()["id"]
    resp = await client.delete(f"/api/v1/forecasts/{fc_id}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_run_forecast(client: AsyncClient):
    series_id = await _create_series_with_points(client, "Run Test Series")
    resp = await client.post("/api/v1/forecasts/run", json={
        "data_series_id": series_id,
        "model_type": "linear",
        "horizon_months": 3,
        "name": "Run Test",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["data_series_id"] == series_id
    assert data["model_type"] == "linear"


@pytest.mark.asyncio
async def test_run_forecast_series_not_found(client: AsyncClient):
    resp = await client.post("/api/v1/forecasts/run", json={
        "data_series_id": "00000000-0000-0000-0000-000000000000",
        "model_type": "ensemble",
        "horizon_months": 6,
    })
    assert resp.status_code == 404
