"""Multi-model forecasting engine.

Supports: linear trend, exponential smoothing (ETS), and ensemble (average).
All models use only the stdlib + numpy (no heavy ML deps required).
"""
import math
import uuid
from datetime import date, timedelta
from typing import Any

import numpy as np


def _date_range(start: date, months: int) -> list[date]:
    dates = []
    current = start
    for _ in range(months):
        month = current.month + 1
        year = current.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        current = date(year, month, 1)
        dates.append(current)
    return dates


def _seasonal_factors(values: list[float], period: int = 12) -> list[float]:
    """Compute multiplicative seasonal indices over `period`."""
    n = len(values)
    if n < period * 2:
        return [1.0] * period
    overall_mean = np.mean(values) or 1.0
    indices = []
    for i in range(period):
        season_vals = [values[j] for j in range(i, n, period)]
        indices.append(np.mean(season_vals) / overall_mean)
    return indices


def _linear_forecast(values: list[float], horizon: int, seasonal: bool = True) -> tuple[list[float], list[float], list[float]]:
    n = len(values)
    x = np.arange(n, dtype=float)
    y = np.array(values, dtype=float)
    if n >= 2:
        slope, intercept = np.polyfit(x, y, 1)
    else:
        slope, intercept = 0.0, float(y[0]) if n else 0.0

    preds = []
    for i in range(horizon):
        preds.append(slope * (n + i) + intercept)

    if seasonal and n >= 24:
        factors = _seasonal_factors(values)
        last_month_idx = (n - 1) % 12
        for i in range(horizon):
            month_idx = (last_month_idx + 1 + i) % 12
            preds[i] *= factors[month_idx]

    std = float(np.std(y)) if n > 1 else abs(preds[0]) * 0.1 + 1
    lower = [max(0.0, p - 1.96 * std) for p in preds]
    upper = [p + 1.96 * std for p in preds]
    return preds, lower, upper


def _ets_forecast(values: list[float], horizon: int) -> tuple[list[float], list[float], list[float]]:
    """Simple Holt-Winters exponential smoothing."""
    alpha, beta = 0.3, 0.1
    if not values:
        return [0.0] * horizon, [0.0] * horizon, [0.0] * horizon

    level = float(values[0])
    trend = (float(values[-1]) - float(values[0])) / max(len(values) - 1, 1)

    for v in values[1:]:
        prev_level = level
        level = alpha * v + (1 - alpha) * (level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend

    preds = [level + trend * (i + 1) for i in range(horizon)]
    std = float(np.std(values)) if len(values) > 1 else abs(level) * 0.1 + 1
    lower = [max(0.0, p - 1.96 * std) for p in preds]
    upper = [p + 1.96 * std for p in preds]
    return preds, lower, upper


def _mape(actuals: list[float], predicted: list[float]) -> float:
    errors = []
    for a, p in zip(actuals, predicted):
        if a != 0:
            errors.append(abs((a - p) / a))
    return float(np.mean(errors) * 100) if errors else 0.0


def run_forecast(
    values: list[float],
    last_date: date,
    model_type: str,
    horizon_months: int,
) -> dict[str, Any]:
    """Run forecast and return points + MAPE."""
    future_dates = _date_range(last_date, horizon_months)

    if model_type == "linear":
        preds, lower, upper = _linear_forecast(values, horizon_months)
    elif model_type == "ets":
        preds, lower, upper = _ets_forecast(values, horizon_months)
    else:  # ensemble
        lin_p, lin_l, lin_u = _linear_forecast(values, horizon_months)
        ets_p, ets_l, ets_u = _ets_forecast(values, horizon_months)
        preds = [(a + b) / 2 for a, b in zip(lin_p, ets_p)]
        lower = [(a + b) / 2 for a, b in zip(lin_l, ets_l)]
        upper = [(a + b) / 2 for a, b in zip(lin_u, ets_u)]

    # Cross-validation MAPE on last 20% of training data
    holdout = max(2, len(values) // 5)
    train = values[:-holdout]
    actual = values[-holdout:]
    if train and model_type == "linear":
        cv_preds, _, _ = _linear_forecast(train, holdout)
    elif train and model_type == "ets":
        cv_preds, _, _ = _ets_forecast(train, holdout)
    elif train:
        cv_lin, _, _ = _linear_forecast(train, holdout)
        cv_ets, _, _ = _ets_forecast(train, holdout)
        cv_preds = [(a + b) / 2 for a, b in zip(cv_lin, cv_ets)]
    else:
        cv_preds = actual

    mape = _mape(actual, cv_preds)

    points = [
        {"date": d, "value": round(p, 4), "lower_bound": round(l, 4), "upper_bound": round(u, 4)}
        for d, p, l, u in zip(future_dates, preds, lower, upper)
    ]
    return {"points": points, "mape": round(mape, 2)}


def select_best_model(values: list[float]) -> str:
    """Pick the model with the lowest cross-validated MAPE."""
    holdout = max(2, len(values) // 5)
    train = values[:-holdout]
    actual = values[-holdout:]
    if not train:
        return "ensemble"

    scores: dict[str, float] = {}
    for model in ("linear", "ets"):
        if model == "linear":
            preds, _, _ = _linear_forecast(train, holdout, seasonal=False)
        else:
            preds, _, _ = _ets_forecast(train, holdout)
        scores[model] = _mape(actual, preds)

    lin_p, _, _ = _linear_forecast(train, holdout)
    ets_p, _, _ = _ets_forecast(train, holdout)
    ens_p = [(a + b) / 2 for a, b in zip(lin_p, ets_p)]
    scores["ensemble"] = _mape(actual, ens_p)

    return min(scores, key=scores.get)
