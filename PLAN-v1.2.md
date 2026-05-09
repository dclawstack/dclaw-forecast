# DClaw Forecast — v1.2 Feature Roadmap

> Based on: Y Combinator vertical SaaS principles, trending GitHub repos (prophet, nixtla), AI product research (Databricks, DataRobot, Anaplan, Planful)

## Pre-Flight Checklist

- [ ] `frontend/package-lock.json` committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `docker-compose.yml` healthchecks correct
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

## v1.0 Feature Inventory (Current)

- [ ] Time-series data ingestion
- [ ] Basic forecasting models
- [ ] Forecast visualization
- [ ] Scenario comparison
- [ ] Real backend CRUD (no mocks)
- [ ] Docker + Helm deployment
- [ ] Alembic migrations
- [ ] Backend tests

---

## v1.2 Roadmap

### P0 — Must Have (Ship in v1.0, demo-ready)

#### 1. AI Forecast Copilot (Planning Advisor)
**Description:** AI assistant that explains forecasts, suggests scenarios, and answers planning questions. "What happens to revenue if we raise prices 10%?"
- **AI Angle:** Scenario modeling + natural language interaction with forecast models.
- **Backend:** `/api/v1/ai/forecast-chat` endpoint. Scenario engine.
- **Frontend:** Chat panel with forecast charts and scenario sliders.
- **Files:** `backend/app/services/forecast_ai.py`, `frontend/src/components/forecast-copilot.tsx`

#### 2. Multi-Model Forecasting
**Description:** Auto-select best model (ARIMA, Prophet, LSTM, XGBoost) with cross-validation.
- **Backend:** Model selection pipeline. Automated training.
- **Frontend:** Model comparison with accuracy metrics.
- **Files:** `backend/app/services/forecast_engine.py`

#### 3. Interactive Scenario Planning
**Description:** Adjust assumptions and see real-time forecast updates. Save and compare scenarios.
- **Backend:** Scenario calculation engine. Assumption management.
- **Frontend:** Scenario builder with sliders and what-if analysis.
- **Files:** `frontend/src/app/scenarios/builder.tsx`

#### 4. Data Ingestion & Feature Engineering
**Description:** Import time-series data. Auto-detect seasonality, holidays, and external regressors.
- **Backend:** Data pipeline with feature engineering.
- **Frontend:** Data import wizard. Feature preview.
- **Files:** `backend/app/services/data_pipeline.py`

### P1 — Should Have (v1.1–1.2)

#### 5. Collaborative Planning
**Description:** Multiple users contribute assumptions and forecasts. Consensus building.
- **Backend:** Collaboration engine with version control.
- **Frontend:** Planning workspace with user contributions.

#### 6. Forecast Accuracy Tracking
**Description:** Compare forecasts to actuals. Track MAPE, bias, and accuracy over time.
- **Backend:** Accuracy calculation engine.
- **Frontend:** Accuracy dashboard with model leaderboard.

#### 7. Anomaly Detection & Alerts
**Description:** Detect unexpected deviations from forecast. Alert stakeholders.
- **AI Angle:** Statistical anomaly detection on residuals.
- **Backend:** Alert engine with threshold rules.
- **Frontend:** Anomaly timeline with investigation notes.

#### 8. Hierarchical Forecasting
**Description:** Forecast at multiple levels (SKU → Category → Division → Company) with reconciliation.
- **Backend:** Hierarchical reconciliation engine.
- **Frontend:** Drill-down forecast tree.

### P2 — Could Have (v1.3+)

#### 9. Causal Impact Analysis
**Description:** Measure the impact of specific events (promotions, policy changes) on forecasts.

#### 10. Probabilistic Forecasting
**Description:** Generate prediction intervals and quantile forecasts for risk assessment.

#### 11. Demand Sensing
**Description:** Incorporate real-time signals (weather, social trends, news) into forecasts.

#### 12. Monte Carlo Simulation
**Description:** Run thousands of simulations to model forecast uncertainty and risk.

---

## Implementation Priority

1. **Week 1–2:** AI Forecast Copilot (P0.1) + Multi-Model Forecasting (P0.2)
2. **Week 3–4:** Scenario Planning (P0.3) + Data Ingestion (P0.4)
3. **Week 5–6:** Collaborative Planning (P1.5) + Accuracy Tracking (P1.6)
4. **Week 7–8:** Anomaly Detection (P1.7) + Hierarchical Forecasting (P1.8)
