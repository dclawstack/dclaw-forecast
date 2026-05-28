import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_data_series(client: AsyncClient):
    resp = await client.post("/api/v1/data-series", json={
        "name": "Electronics Demand",
        "description": "Monthly electronics unit sales",
        "unit": "units",
        "data_type": "demand",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Electronics Demand"
    assert data["unit"] == "units"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_data_series(client: AsyncClient):
    await client.post("/api/v1/data-series", json={"name": "Revenue", "data_type": "revenue"})
    resp = await client.get("/api/v1/data-series")
    assert resp.status_code == 200
    body = resp.json()
    assert "items" in body
    assert body["total"] >= 1


@pytest.mark.asyncio
async def test_get_data_series(client: AsyncClient):
    create_resp = await client.post("/api/v1/data-series", json={"name": "Test Series"})
    series_id = create_resp.json()["id"]
    resp = await client.get(f"/api/v1/data-series/{series_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == series_id


@pytest.mark.asyncio
async def test_get_data_series_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/data-series/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_data_series(client: AsyncClient):
    create_resp = await client.post("/api/v1/data-series", json={"name": "Old Name"})
    series_id = create_resp.json()["id"]
    resp = await client.patch(f"/api/v1/data-series/{series_id}", json={"name": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


@pytest.mark.asyncio
async def test_delete_data_series(client: AsyncClient):
    create_resp = await client.post("/api/v1/data-series", json={"name": "To Delete"})
    series_id = create_resp.json()["id"]
    resp = await client.delete(f"/api/v1/data-series/{series_id}")
    assert resp.status_code == 204
    get_resp = await client.get(f"/api/v1/data-series/{series_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_add_data_points(client: AsyncClient):
    create_resp = await client.post("/api/v1/data-series", json={"name": "Monthly"})
    series_id = create_resp.json()["id"]
    resp = await client.post(f"/api/v1/data-series/{series_id}/points", json={
        "data_points": [
            {"date": "2024-01-01", "value": 100.0},
            {"date": "2024-02-01", "value": 120.0},
            {"date": "2024-03-01", "value": 115.0},
        ]
    })
    assert resp.status_code == 200
    assert len(resp.json()) == 3


@pytest.mark.asyncio
async def test_get_data_points(client: AsyncClient):
    create_resp = await client.post("/api/v1/data-series", json={"name": "Points Test"})
    series_id = create_resp.json()["id"]
    await client.post(f"/api/v1/data-series/{series_id}/points", json={
        "data_points": [{"date": "2024-01-01", "value": 50.0}]
    })
    resp = await client.get(f"/api/v1/data-series/{series_id}/points")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


@pytest.mark.asyncio
async def test_analyze_series(client: AsyncClient):
    create_resp = await client.post("/api/v1/data-series", json={"name": "Analyze Test"})
    series_id = create_resp.json()["id"]
    points = [{"date": f"2022-{m:02d}-01", "value": float(100 + m * 5)} for m in range(1, 13)]
    points += [{"date": f"2023-{m:02d}-01", "value": float(120 + m * 5)} for m in range(1, 13)]
    await client.post(f"/api/v1/data-series/{series_id}/points", json={"data_points": points})
    resp = await client.get(f"/api/v1/data-series/{series_id}/analyze")
    assert resp.status_code == 200
    body = resp.json()
    assert "summary" in body
    assert "seasonality" in body
