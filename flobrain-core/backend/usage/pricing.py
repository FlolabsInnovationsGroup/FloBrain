"""Per-model token pricing for cost estimation stored in TokenUsageRecord."""

from decimal import Decimal
from typing import Optional

# Cost per 1,000 tokens in USD (input / output split)
# Source: provider pricing pages — update when rates change
_PRICING: dict[str, tuple[Decimal, Decimal]] = {
    # ── OpenAI ─────────────────────────────────────────────────────────────
    "gpt-3.5-turbo":           (Decimal("0.0005"),   Decimal("0.0015")),
    "gpt-3.5-turbo-0125":      (Decimal("0.0005"),   Decimal("0.0015")),
    "gpt-4o":                  (Decimal("0.0025"),   Decimal("0.01")),
    "gpt-4o-2024-11-20":       (Decimal("0.0025"),   Decimal("0.01")),
    "gpt-4o-mini":             (Decimal("0.00015"),  Decimal("0.0006")),
    "gpt-4o-mini-2024-07-18":  (Decimal("0.00015"),  Decimal("0.0006")),
    "gpt-4-turbo":             (Decimal("0.01"),     Decimal("0.03")),
    "gpt-4-turbo-preview":     (Decimal("0.01"),     Decimal("0.03")),
    "gpt-4":                   (Decimal("0.03"),     Decimal("0.06")),

    # ── Anthropic ──────────────────────────────────────────────────────────
    "claude-opus-4-8":                  (Decimal("0.015"),   Decimal("0.075")),
    "claude-sonnet-4-6":                (Decimal("0.003"),   Decimal("0.015")),
    "claude-haiku-4-5":                 (Decimal("0.0008"),  Decimal("0.004")),
    "claude-haiku-4-5-20251001":        (Decimal("0.0008"),  Decimal("0.004")),
    "claude-3-5-sonnet-20241022":       (Decimal("0.003"),   Decimal("0.015")),
    "claude-3-5-haiku-20241022":        (Decimal("0.0008"),  Decimal("0.004")),
    "claude-3-opus-20240229":           (Decimal("0.015"),   Decimal("0.075")),
    "claude-3-sonnet-20240229":         (Decimal("0.003"),   Decimal("0.015")),
    "claude-3-haiku-20240307":          (Decimal("0.00025"), Decimal("0.00125")),
}

# Prefix fallbacks for versioned model names not in the table above
_PREFIXES: list[tuple[str, Decimal, Decimal]] = [
    ("gpt-4o-mini",       Decimal("0.00015"),  Decimal("0.0006")),
    ("gpt-4o",            Decimal("0.0025"),   Decimal("0.01")),
    ("gpt-4-turbo",       Decimal("0.01"),     Decimal("0.03")),
    ("gpt-4",             Decimal("0.03"),     Decimal("0.06")),
    ("gpt-3.5-turbo",     Decimal("0.0005"),   Decimal("0.0015")),
    ("claude-opus-4",     Decimal("0.015"),    Decimal("0.075")),
    ("claude-sonnet-4",   Decimal("0.003"),    Decimal("0.015")),
    ("claude-haiku-4",    Decimal("0.0008"),   Decimal("0.004")),
    ("claude-3-5-sonnet", Decimal("0.003"),    Decimal("0.015")),
    ("claude-3-5-haiku",  Decimal("0.0008"),   Decimal("0.004")),
    ("claude-3-opus",     Decimal("0.015"),    Decimal("0.075")),
    ("claude-3-sonnet",   Decimal("0.003"),    Decimal("0.015")),
    ("claude-3-haiku",    Decimal("0.00025"),  Decimal("0.00125")),
    ("claude-opus",       Decimal("0.015"),    Decimal("0.075")),
    ("claude-sonnet",     Decimal("0.003"),    Decimal("0.015")),
    ("claude-haiku",      Decimal("0.0008"),   Decimal("0.004")),
]


def compute_cost_usd(
    model: str, prompt_tokens: int, completion_tokens: int
) -> Optional[float]:
    """Return estimated USD cost, or None if the model is unknown."""
    key = model.lower().strip()

    rates = _PRICING.get(key)
    if rates is None:
        for prefix, prompt_rate, completion_rate in _PREFIXES:
            if key.startswith(prefix):
                rates = (prompt_rate, completion_rate)
                break

    if rates is None:
        return None

    prompt_rate, completion_rate = rates
    cost = (
        prompt_rate * Decimal(prompt_tokens) / 1000
        + completion_rate * Decimal(completion_tokens) / 1000
    )
    return float(round(cost, 6))
