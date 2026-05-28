# API Reference — DClaw Forecast

> Back: [[Welcome]] | Plan: [[Feature Plan v1.2]]

Base URL: `http://localhost:8134/api/v1`
Docs: `http://localhost:8134/docs`

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health/` | Returns `{"status": "ok"}` |

---

## Dashboard

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/v1/dashboard` | `DashboardStats` |

**DashboardStats:**
```json
{
  "total_data_series": 3,
  "total_forecasts": 5,
  "total_scenarios": 2,
  "completed_forecasts": 4,
  "avg_mape": 8.5,
  "recent_forecasts": [...]
}
```

---

## Data Series

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/data-series` | List all series (paginated) |
| POST | `/api/v1/data-series` | Create series |
| GET | `/api/v1/data-series/{id}` | Get series |
| PATCH | `/api/v1/data-series/{id}` | Update series |
| DELETE | `/api/v1/data-series/{id}` | Delete series |
| POST | `/api/v1/data-series/{id}/points` | Bulk add data points |
| GET | `/api/v1/data-series/{id}/points` | Get data points |
| POST | `/api/v1/data-series/{id}/import-csv` | Import CSV file |
| GET | `/api/v1/data-series/{id}/analyze` | Seasonality + summary analysis |

**Create Series body:**
```json
{ "name": "Electronics", "unit": "units", "data_type": "demand" }
```

**Add Points body:**
```json
{
  "data_points": [
    { "date": "2024-01-01", "value": 100.0 },
    { "date": "2024-02-01", "value": 120.0 }
  ]
}
```

---

## Forecasts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/forecasts` | List all forecasts |
| POST | `/api/v1/forecasts` | Create forecast record |
| POST | `/api/v1/forecasts/run` | Create + run forecast (background) |
| GET | `/api/v1/forecasts/{id}` | Get forecast + points |
| PATCH | `/api/v1/forecasts/{id}` | Update forecast |
| DELETE | `/api/v1/forecasts/{id}` | Delete forecast |

**Run Forecast body:**
```json
{
  "data_series_id": "uuid",
  "model_type": "ensemble",
  "horizon_months": 12,
  "name": "Q4 2025 Forecast"
}
```

Models: `linear`, `ets`, `ensemble`, `auto` (auto-selects best by MAPE)

**Forecast status:** `pending` → `running` → `completed` | `failed`

---

## Scenarios

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/scenarios` | List scenarios |
| POST | `/api/v1/scenarios` | Create scenario |
| GET | `/api/v1/scenarios/{id}` | Get scenario |
| PATCH | `/api/v1/scenarios/{id}` | Update scenario |
| DELETE | `/api/v1/scenarios/{id}` | Delete scenario |
| GET | `/api/v1/scenarios/{id}/result` | Apply adjustment to base forecast |

**Create Scenario body:**
```json
{
  "name": "Optimistic",
  "base_forecast_id": "uuid",
  "adjustment_pct": 10.0,
  "assumptions": { "price_change": 0, "volume_change": 10 },
  "status": "draft"
}
```

---

## AI Copilot

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/ai/forecast-chat` | Send message, get AI response |
| GET | `/api/v1/ai/forecast-chat/{session_id}/history` | Get conversation history |
| DELETE | `/api/v1/ai/forecast-chat/{session_id}/history` | Clear history |

**Chat body:**
```json
{
  "session_id": "my-session-123",
  "message": "What does MAPE mean?",
  "context": { "current_mape": 8.5, "model_type": "ensemble" }
}
```

**Chat response:**
```json
{
  "session_id": "my-session-123",
  "message": "MAPE (Mean Absolute Percentage Error) measures...",
  "suggestions": ["Try running a scenario with...", "Upload more data..."]
}
```

Configure LLM via env vars:
- `OPENAI_API_KEY` or `AI_API_KEY` — enables real LLM responses
- `AI_ENDPOINT` — custom endpoint (default: OpenAI)
- `AI_MODEL` — model name (default: `gpt-4o-mini`)

Without a key, rule-based fallback responses are returned.
