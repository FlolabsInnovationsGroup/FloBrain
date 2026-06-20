"""Plan token/request limits — update here without code changes elsewhere."""

PLAN_LIMITS = {
    "personal": {
        "monthly_token_limit": 100_000,
        "monthly_request_limit": 100,
        "models": ["gpt-3.5-turbo"],
    },
    "pro": {
        "monthly_token_limit": 5_000_000,
        "monthly_request_limit": 500_000,
        "models": ["gpt-3.5-turbo", "gpt-4o", "claude-3-sonnet", "gemini-pro"],
    },
    "enterprise": {
        "monthly_token_limit": None,
        "monthly_request_limit": None,
        "models": None,
    },
}

DEFAULT_PLAN = "personal"
