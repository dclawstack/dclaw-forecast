# Directory Structure — dclaw-forecast

> GitHub: [dclawstack/dclaw-forecast](https://github.com/dclawstack/dclaw-forecast)
> Back: [[Welcome]]

```
dclaw-forecast/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 0001_initial_forecast_schema.py  ← All 6 tables
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── alembic.ini
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py                   ← FastAPI app + router wiring
│   │   │   ├── routes/
│   │   │   │   └── health.py
│   │   │   └── v1/
│   │   │       ├── ai.py                 ← AI Copilot: /api/v1/ai/forecast-chat
│   │   │       ├── dashboard.py          ← /api/v1/dashboard
│   │   │       ├── data_series.py        ← /api/v1/data-series (CRUD + CSV import)
│   │   │       ├── forecasts.py          ← /api/v1/forecasts (CRUD + /run)
│   │   │       └── scenarios.py          ← /api/v1/scenarios (CRUD + /result)
│   │   ├── core/
│   │   │   ├── config.py                 ← Settings (app_name, database_url, AI keys)
│   │   │   ├── database.py               ← Engine, get_db, init_db
│   │   │   └── utils.py                  ← utc_now()
│   │   ├── models/
│   │   │   ├── base.py                   ← DeclarativeBase
│   │   │   ├── chat.py                   ← ChatMessage
│   │   │   ├── forecast.py               ← DataSeries, DataPoint, Forecast, ForecastPoint
│   │   │   └── scenario.py               ← Scenario
│   │   ├── repositories/
│   │   │   ├── base_repo.py              ← Generic async CRUD
│   │   │   ├── chat_repo.py              ← ChatRepository
│   │   │   ├── forecast_repo.py          ← DataSeriesRepository, ForecastRepository
│   │   │   └── scenario_repo.py          ← ScenarioRepository
│   │   ├── schemas/
│   │   │   ├── chat.py                   ← ChatRequest, ChatResponse, ChatHistoryOut
│   │   │   ├── dashboard.py              ← DashboardStats
│   │   │   ├── forecast.py               ← DataSeries*, Forecast*, ForecastPoint* schemas
│   │   │   └── scenario.py               ← Scenario* schemas
│   │   └── services/
│   │       ├── data_pipeline.py          ← CSV parsing, seasonality detection
│   │       ├── forecast_ai.py            ← AI Copilot (LLM call + rule-based fallback)
│   │       └── forecast_engine.py        ← Linear, ETS, Ensemble models + MAPE
│   ├── tests/
│   │   ├── conftest.py                   ← Test DB setup, client fixture
│   │   ├── test_ai.py                    ← AI chat endpoint tests
│   │   ├── test_dashboard.py             ← Dashboard stats tests
│   │   ├── test_data_series.py           ← Data series CRUD + import tests
│   │   ├── test_forecasts.py             ← Forecast CRUD + run tests
│   │   ├── test_health.py
│   │   └── test_scenarios.py             ← Scenario CRUD + result tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── ai/page.tsx               ← AI Copilot page
│   │   │   ├── data/page.tsx             ← Data Series management
│   │   │   ├── forecasts/page.tsx        ← Forecast list + run + expand
│   │   │   ├── scenarios/page.tsx        ← Scenario builder + what-if result
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx                ← Root layout + Nav
│   │   │   └── page.tsx                  ← Dashboard
│   │   ├── components/
│   │   │   ├── Nav.tsx                   ← Top navigation bar
│   │   │   ├── forecast-copilot.tsx      ← AI chat component
│   │   │   └── ui/                       ← Pre-built components (do not modify)
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── select.tsx
│   │   │       ├── table.tsx
│   │   │       └── tabs.tsx
│   │   └── lib/
│   │       ├── api.ts                    ← Full typed API client (all endpoints)
│   │       └── utils.ts                  ← cn() helper
│   ├── public/
│   │   └── dclaw-manifest.json           ← DPanel registration manifest
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── vault/                                ← Obsidian vault (this file)
│   ├── Welcome.md
│   ├── Directory Structure.md
│   ├── Feature Plan v1.2.md
│   ├── Design System.md
│   └── API Reference.md
├── helm/
├── .github/workflows/
├── docs/
├── docker-compose.yml
├── .env.example
├── AGENTS.md
├── PLAN-v1.2.md
├── PRODUCT-SPEC.md
├── REVISED-PRD.md
└── README.md
```

## Key Areas

| Path | Purpose |
|------|---------|
| `backend/app/api/v1/` | FastAPI route handlers |
| `backend/app/models/` | SQLAlchemy ORM models (6 tables) |
| `backend/app/repositories/` | Data access layer (repository pattern) |
| `backend/app/schemas/` | Pydantic v2 request/response schemas |
| `backend/app/services/` | Business logic: forecast engine, AI copilot, data pipeline |
| `backend/alembic/versions/` | Database migration scripts |
| `frontend/src/app/` | Next.js App Router pages |
| `frontend/src/components/` | React components (Nav, ForecastCopilot, ui/*) |
| `frontend/src/lib/api.ts` | Typed fetch API client |
| `frontend/public/dclaw-manifest.json` | DPanel registration |
