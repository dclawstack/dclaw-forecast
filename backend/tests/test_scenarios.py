import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_scenario(client: AsyncClient):
    resp = await client.post("/api/v1/scenarios", json={
        "name": "Optimistic",
        "description": "10% demand uplift",
        "adjustment_pct": 10.0,
        "assumptions": {"price_change": 0.0, "volume_change": 10.0},
        "status": "draft",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Optimistic"
    assert data["adjustment_pct"] == 10.0


@pytest.mark.asyncio
async def test_list_scenarios(client: AsyncClient):
    await client.post("/api/v1/scenarios", json={"name": "Base Case"})
    resp = await client.get("/api/v1/scenarios")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= 1


@pytest.mark.asyncio
async def test_get_scenario(client: AsyncClient):
    create_resp = await client.post("/api/v1/scenarios", json={"name": "Test"})
    sc_id = create_resp.json()["id"]
    resp = await client.get(f"/api/v1/scenarios/{sc_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == sc_id


@pytest.mark.asyncio
async def test_get_scenario_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/scenarios/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_scenario(client: AsyncClient):
    create_resp = await client.post("/api/v1/scenarios", json={"name": "Draft"})
    sc_id = create_resp.json()["id"]
    resp = await client.patch(f"/api/v1/scenarios/{sc_id}", json={
        "name": "Active", "status": "active", "adjustment_pct": -5.0
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "active"
    assert data["adjustment_pct"] == -5.0


@pytest.mark.asyncio
async def test_delete_scenario(client: AsyncClient):
    create_resp = await client.post("/api/v1/scenarios", json={"name": "Del"})
    sc_id = create_resp.json()["id"]
    resp = await client.delete(f"/api/v1/scenarios/{sc_id}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_scenario_result_no_base_forecast(client: AsyncClient):
    resp_sc = await client.post("/api/v1/scenarios", json={"name": "No Base"})
    sc_id = resp_sc.json()["id"]
    resp = await client.get(f"/api/v1/scenarios/{sc_id}/result")
    assert resp.status_code == 422
