"""Data ingestion and feature engineering pipeline.

Parses CSV/JSON time-series data and auto-detects seasonality.
"""
import csv
import io
from datetime import date, datetime
from typing import Any


def parse_csv(content: str, date_col: str = "date", value_col: str = "value") -> list[dict]:
    """Parse CSV string into list of {date, value} dicts."""
    reader = csv.DictReader(io.StringIO(content.strip()))
    points: list[dict] = []
    for row in reader:
        raw_date = row.get(date_col, "").strip()
        raw_value = row.get(value_col, "").strip()
        if not raw_date or not raw_value:
            continue
        parsed_date = _parse_date(raw_date)
        if parsed_date is None:
            continue
        try:
            points.append({"date": parsed_date, "value": float(raw_value)})
        except ValueError:
            continue
    return sorted(points, key=lambda p: p["date"])


def _parse_date(raw: str) -> date | None:
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d", "%b %Y", "%B %Y", "%Y-%m"):
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    return None


def detect_seasonality(values: list[float], period: int = 12) -> dict[str, Any]:
    """Detect seasonality strength in time-series values.

    Returns: {has_seasonality, dominant_period, strength, description}
    """
    n = len(values)
    if n < period * 2:
        return {
            "has_seasonality": False,
            "dominant_period": None,
            "strength": 0.0,
            "description": "Insufficient data for seasonality detection (need 24+ data points)",
        }

    import numpy as np  # noqa: PLC0415

    # Compute autocorrelation at lag=period
    arr = np.array(values, dtype=float)
    mean = arr.mean()
    variance = ((arr - mean) ** 2).mean()
    if variance < 1e-10:
        return {"has_seasonality": False, "dominant_period": None, "strength": 0.0, "description": "Constant series"}

    def autocorr(lag: int) -> float:
        shifted = arr[lag:] - mean
        original = arr[:-lag] - mean
        return float(np.mean(shifted * original) / variance)

    ac = autocorr(period)
    has_seasonality = ac > 0.3
    description = (
        f"Strong seasonality detected (period={period} months, autocorr={ac:.2f})"
        if ac > 0.5
        else f"Mild seasonality detected (period={period} months, autocorr={ac:.2f})"
        if has_seasonality
        else f"No significant seasonality (autocorr={ac:.2f})"
    )
    return {
        "has_seasonality": has_seasonality,
        "dominant_period": period if has_seasonality else None,
        "strength": round(max(0.0, ac), 4),
        "description": description,
    }


def summarize_series(values: list[float]) -> dict[str, Any]:
    if not values:
        return {}
    import numpy as np  # noqa: PLC0415
    arr = np.array(values, dtype=float)
    return {
        "count": len(values),
        "mean": round(float(arr.mean()), 2),
        "std": round(float(arr.std()), 2),
        "min": round(float(arr.min()), 2),
        "max": round(float(arr.max()), 2),
        "trend": "increasing" if arr[-1] > arr[0] else "decreasing" if arr[-1] < arr[0] else "flat",
    }
