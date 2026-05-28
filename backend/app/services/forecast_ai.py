"""AI Forecast Copilot service.

Tries to call a configured LLM (via OPENAI_API_KEY or AI_ENDPOINT).
Falls back to rule-based responses when no LLM is available.
"""
import json
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are DClaw Forecast Copilot — an expert in demand forecasting,
revenue planning, and resource planning. You help analysts understand forecasts,
model scenarios, and make data-driven decisions.

When given forecast data, explain patterns clearly and suggest actionable next steps.
Keep answers concise (under 150 words). Always end with 1-3 concrete suggestions."""

_RULE_RESPONSES: dict[str, str] = {
    "mape": "MAPE (Mean Absolute Percentage Error) measures forecast accuracy. A MAPE < 15% is considered good for demand forecasting. Lower is better — 5% is excellent, 20%+ needs attention.",
    "scenario": "Scenarios let you model what-if assumptions. Try adjusting the price +10%, running the forecast, then comparing it to the baseline. Scenarios with <5% revenue variance are low-risk.",
    "season": "Seasonality patterns repeat annually. Your data may show peaks during Q4 (holidays) or Q2 (spring). The ensemble model automatically detects and adjusts for these cycles.",
    "accuracy": "To improve forecast accuracy: (1) Add more historical data (2 years minimum), (2) Include external regressors like promotions, (3) Use ensemble models for volatile series.",
    "revenue": "Revenue forecasts aggregate product-line demand × price. Upload your historical revenue data series, run the ensemble model, and compare scenarios for pricing or volume changes.",
    "demand": "Demand forecasting uses historical sales patterns to predict future demand. Upload your time-series data, choose a horizon (3–12 months), and the engine auto-selects the best model.",
    "default": "I can help you understand forecasts, compare scenarios, and plan ahead. Try asking: 'What does MAPE mean?', 'How do I compare scenarios?', or 'How can I improve accuracy?'",
}


def _rule_based_response(message: str) -> tuple[str, list[str]]:
    msg_lower = message.lower()
    for keyword, response in _RULE_RESPONSES.items():
        if keyword in msg_lower:
            suggestions = [
                "Try running a scenario with a 10% adjustment",
                "Upload more historical data for better accuracy",
                "Compare linear vs ensemble model results",
            ]
            return response, suggestions
    return _RULE_RESPONSES["default"], [
        "Ask about MAPE and forecast accuracy",
        "Ask how to create a scenario",
        "Ask how to interpret seasonal patterns",
    ]


async def chat_with_copilot(
    message: str,
    history: list[dict[str, str]],
    context: dict[str, Any] | None = None,
) -> tuple[str, list[str]]:
    """Send message to AI copilot. Returns (response_text, suggestions)."""
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("AI_API_KEY")
    ai_endpoint = os.getenv("AI_ENDPOINT", "https://api.openai.com/v1/chat/completions")
    ai_model = os.getenv("AI_MODEL", "gpt-4o-mini")

    if not api_key:
        return _rule_based_response(message)

    messages = [{"role": "system", "content": _SYSTEM_PROMPT}]
    if context:
        messages.append({
            "role": "system",
            "content": f"Current forecast context: {json.dumps(context)}"
        })
    for h in history[-6:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                ai_endpoint,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={"model": ai_model, "messages": messages, "max_tokens": 300, "temperature": 0.7},
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            suggestions = [
                "Run a new forecast with these assumptions",
                "Compare this with your baseline scenario",
                "Export results for stakeholder review",
            ]
            return content, suggestions
    except Exception as exc:
        logger.warning("AI endpoint failed, using rule-based fallback: %s", exc)
        return _rule_based_response(message)
