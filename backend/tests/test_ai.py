import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_forecast_chat(client: AsyncClient):
    resp = await client.post("/api/v1/ai/forecast-chat", json={
        "session_id": "test-session-1",
        "message": "What does MAPE mean?",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["session_id"] == "test-session-1"
    assert len(data["message"]) > 0
    assert "suggestions" in data


@pytest.mark.asyncio
async def test_forecast_chat_with_context(client: AsyncClient):
    resp = await client.post("/api/v1/ai/forecast-chat", json={
        "session_id": "test-session-2",
        "message": "How do I improve accuracy?",
        "context": {"current_mape": 12.5, "model_type": "linear"},
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_chat_history(client: AsyncClient):
    session = "history-test-session"
    await client.post("/api/v1/ai/forecast-chat", json={
        "session_id": session, "message": "Hello"
    })
    resp = await client.get(f"/api/v1/ai/forecast-chat/{session}/history")
    assert resp.status_code == 200
    data = resp.json()
    assert data["session_id"] == session
    assert len(data["messages"]) >= 2  # user + assistant


@pytest.mark.asyncio
async def test_clear_chat_history(client: AsyncClient):
    session = "clear-test-session"
    await client.post("/api/v1/ai/forecast-chat", json={
        "session_id": session, "message": "Hello"
    })
    resp = await client.delete(f"/api/v1/ai/forecast-chat/{session}/history")
    assert resp.status_code == 204
    history_resp = await client.get(f"/api/v1/ai/forecast-chat/{session}/history")
    assert history_resp.json()["messages"] == []


@pytest.mark.asyncio
async def test_chat_demand_question(client: AsyncClient):
    resp = await client.post("/api/v1/ai/forecast-chat", json={
        "session_id": "demand-session",
        "message": "How does demand forecasting work?",
    })
    assert resp.status_code == 200
    assert len(resp.json()["suggestions"]) > 0
