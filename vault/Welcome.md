# DClaw Forecast — Obsidian Vault

> GitHub: [dclawstack/dclaw-forecast](https://github.com/dclawstack/dclaw-forecast)
> PRD: [[REVISED-PRD]] | Plan: [[Feature Plan v1.2]] | Structure: [[Directory Structure]]

## What is DClaw Forecast?

DClaw Forecast is a vertical SaaS application for AI-powered demand forecasting, scenario planning, and resource planning. It is built on the [DClaw Stack](https://github.com/dclawstack) — FastAPI + Next.js + PostgreSQL.

## Quick Navigation

| Page | Purpose |
|------|---------|
| [[Directory Structure]] | Full file tree with annotations |
| [[Feature Plan v1.2]] | P0/P1/P2 feature roadmap |
| [[Design System]] | Colors, typography, component tokens |
| [[API Reference]] | All backend endpoints |

## App Identity

| Field | Value |
|-------|-------|
| **App ID** | `forecast` |
| **Category** | Operations |
| **Tagline** | AI-powered demand forecasting |
| **Color** | `#10B981` (Teal-500) |
| **Backend Port** | `8134` |
| **Frontend Port** | `3048` |
| **Database** | `dclaw_forecast` |
| **Maturity** | 🟡 Tier 2 — Active Development |

## P0 Features (Implemented v1.2)

- [x] **AI Forecast Copilot** — `/api/v1/ai/forecast-chat` + chat UI
- [x] **Multi-Model Forecasting** — Linear, ETS, Ensemble models with MAPE cross-validation
- [x] **Interactive Scenario Planning** — What-if adjustment + scenario result comparison
- [x] **Data Ingestion & Feature Engineering** — CSV import, seasonality detection, series analysis
- [x] **Dashboard** — Live stats (series, forecasts, scenarios, avg MAPE)

## P1 Features (Planned)

- [ ] Collaborative Planning
- [ ] Forecast Accuracy Tracking
- [ ] Anomaly Detection & Alerts
- [ ] Hierarchical Forecasting
