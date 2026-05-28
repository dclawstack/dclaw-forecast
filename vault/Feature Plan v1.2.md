# Feature Plan v1.2 — DClaw Forecast

> Full plan: [[../PLAN-v1.2.md]] | Directory: [[Directory Structure]] | Home: [[Welcome]]

## P0 — Must Have (Demo Ready) ✅ Implemented

| # | Feature | Status | Files |
|---|---------|--------|-------|
| P0.1 | **AI Forecast Copilot** | ✅ Done | `services/forecast_ai.py`, `api/v1/ai.py`, `components/forecast-copilot.tsx` |
| P0.2 | **Multi-Model Forecasting** | ✅ Done | `services/forecast_engine.py`, `api/v1/forecasts.py`, `app/forecasts/page.tsx` |
| P0.3 | **Interactive Scenario Planning** | ✅ Done | `api/v1/scenarios.py`, `app/scenarios/page.tsx` |
| P0.4 | **Data Ingestion & Feature Engineering** | ✅ Done | `services/data_pipeline.py`, `api/v1/data_series.py`, `app/data/page.tsx` |

## P1 — Should Have (v1.1–1.2)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| P1.1 | **Scenario Modeling** (Monte Carlo) | ⬜ Planned | Extend scenario engine |
| P1.2 | **Anomaly Detection** | ⬜ Planned | Statistical anomaly scoring on residuals |
| P1.3 | **Collaborative Planning** | ⬜ Planned | Multi-user contributions, consensus |
| P1.4 | **Historical Accuracy Tracking** | ⬜ Planned | Compare forecasts to actuals, MAPE over time |

## P2 — Could Have (v1.3+)

| # | Feature | Status |
|---|---------|--------|
| P2.1 | New Product Forecasting | ⬜ Backlog |
| P2.2 | Seasonal Decomposition (explicit) | ⬜ Backlog |
| P2.3 | Integration with Ops systems | ⬜ Backlog |
| P2.4 | Executive Dashboards + AI narrative | ⬜ Backlog |

## New API Routes (v1.2)

| Method | Route | Feature |
|--------|-------|---------|
| GET | `/api/v1/dashboard` | Dashboard stats |
| GET/POST | `/api/v1/data-series` | Data series CRUD |
| POST | `/api/v1/data-series/{id}/points` | Add data points |
| POST | `/api/v1/data-series/{id}/import-csv` | CSV import |
| GET | `/api/v1/data-series/{id}/analyze` | Seasonality analysis |
| GET/POST | `/api/v1/forecasts` | Forecast CRUD |
| POST | `/api/v1/forecasts/run` | Run forecast (background) |
| GET/POST | `/api/v1/scenarios` | Scenario CRUD |
| GET | `/api/v1/scenarios/{id}/result` | Scenario what-if result |
| POST | `/api/v1/ai/forecast-chat` | AI Copilot chat |
| GET | `/api/v1/ai/forecast-chat/{id}/history` | Chat history |

## Navigation (v1.2)

```
/ → Dashboard (stats: series, forecasts, scenarios, MAPE)
/data → Data Series (create, load sample, analyze, CSV import)
/forecasts → Forecast list + Run (model selector, horizon, expand points)
/scenarios → Scenario builder (what-if adjustment, result view)
/ai → AI Forecast Copilot (chat interface with suggestions)
```

## Forecast Models

| Model | Description | Best For |
|-------|-------------|---------|
| `linear` | Linear regression + seasonal adjustment | Trending series |
| `ets` | Holt-Winters exponential smoothing | Smooth series |
| `ensemble` | Average of linear + ETS | Default, most robust |
| `auto` | Auto-select by cross-validated MAPE | Unknown patterns |
