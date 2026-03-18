from __future__ import annotations

import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from config.settings import settings


class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float) -> None:
        self.capacity = capacity
        self.refill_rate = refill_rate  # tokens per second
        self._tokens = float(capacity)
        self._last_refill = time.monotonic()

    def consume(self, n: int = 1) -> bool:
        now = time.monotonic()
        elapsed = now - self._last_refill
        self._tokens = min(self.capacity, self._tokens + elapsed * self.refill_rate)
        self._last_refill = now
        if self._tokens >= n:
            self._tokens -= n
            return True
        return False

    @property
    def retry_after(self) -> float:
        deficit = 1.0 - self._tokens
        return deficit / self.refill_rate if self.refill_rate > 0 else 60.0


class RateLimiter:
    def __init__(self) -> None:
        self._buckets: dict[str, TokenBucket] = {}

    def _key(self, ip: str, route_type: str) -> str:
        return f"{ip}:{route_type}"

    def check(self, ip: str, route_type: str, capacity: int, rate: float) -> tuple[bool, float]:
        key = self._key(ip, route_type)
        if key not in self._buckets:
            self._buckets[key] = TokenBucket(capacity, rate)
        bucket = self._buckets[key]
        allowed = bucket.consume()
        return allowed, bucket.retry_after if not allowed else 0.0


_rate_limiter = RateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    EXEMPT_PATHS = {"/api/v1/health", "/health", "/docs", "/openapi.json", "/redoc"}

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Exempt health/docs
        if path in self.EXEMPT_PATHS or path.startswith("/docs") or path.startswith("/redoc"):
            return await call_next(request)

        # Get client IP
        forwarded = request.headers.get("X-Forwarded-For")
        ip = (
            forwarded.split(",")[0].strip()
            if forwarded
            else (request.client.host if request.client else "unknown")
        )

        # Determine limit
        is_audio = "/audio/" in path
        capacity = settings.RATE_LIMIT_AUDIO if is_audio else settings.RATE_LIMIT_GENERAL
        rate = capacity / 60.0  # tokens per second

        route_type = "audio" if is_audio else "general"
        allowed, retry_after = _rate_limiter.check(ip, route_type, capacity, rate)

        if not allowed:
            return JSONResponse(
                {"detail": "Rate limit exceeded. Please slow down."},
                status_code=429,
                headers={"Retry-After": str(int(retry_after) + 1)},
            )

        return await call_next(request)
