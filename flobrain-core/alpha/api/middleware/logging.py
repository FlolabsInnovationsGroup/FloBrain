from __future__ import annotations

import json
import time
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Context variable — available anywhere in the request scope
request_id_var: ContextVar[str] = ContextVar("request_id", default="")


def get_request_id() -> str:
    return request_id_var.get()


# Global request counter (int, module-level; good enough for alpha)
_request_count: int = 0


def get_request_count() -> int:
    return _request_count


class RequestTracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        global _request_count
        _request_count += 1

        req_id = str(uuid.uuid4())
        token = request_id_var.set(req_id)

        start = time.monotonic()
        now_iso = datetime.now(timezone.utc).isoformat()

        print(json.dumps({
            "event": "request_start",
            "request_id": req_id,
            "method": request.method,
            "path": request.url.path,
            "user_agent": request.headers.get("user-agent", ""),
            "timestamp": now_iso,
        }), flush=True)

        try:
            response = await call_next(request)
        except Exception as exc:
            request_id_var.reset(token)
            raise

        duration_ms = (time.monotonic() - start) * 1000
        response.headers["X-Request-ID"] = req_id

        print(json.dumps({
            "event": "request_end",
            "request_id": req_id,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": round(duration_ms, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }), flush=True)

        request_id_var.reset(token)
        return response
