import json
import logging
import os
import urllib.error
import urllib.request

from django.conf import settings

from usage.models import TokenUsageRecord

from .base import LLMResult
from .mock_adapter import MockLLMAdapter

logger = logging.getLogger(__name__)


class MultimodalLLMAdapter:
    """Calls the deployed multimodal AI service (flobrain-cloud) for chat + token usage."""

    provider = TokenUsageRecord.PROVIDER_OPENAI

    def __init__(self) -> None:
        base_url = getattr(settings, "MULTIMODAL_SERVICE_URL", None)
        if base_url is None:
            base_url = os.environ.get("MULTIMODAL_SERVICE_URL", "")
        self._base_url = base_url.rstrip("/")
        self._timeout = int(
            getattr(settings, "MULTIMODAL_SERVICE_TIMEOUT", 0)
            or os.environ.get("MULTIMODAL_SERVICE_TIMEOUT", "60")
        )

    def generate(self, messages: list[dict[str, str]], model: str | None = None) -> LLMResult:
        model_name = model or getattr(settings, "LLM_DEFAULT_MODEL", "gpt-3.5-turbo")

        if not self._base_url:
            logger.warning("MULTIMODAL_SERVICE_URL not configured; falling back to mock adapter")
            return MockLLMAdapter().generate(messages, model_name)

        payload = {
            "messages": messages,
            "model": model_name,
        }
        url = f"{self._base_url}/api/v1/chat/"
        headers = {"Content-Type": "application/json"}

        api_key = getattr(settings, "MULTIMODAL_API_KEY", "") or os.environ.get(
            "MULTIMODAL_API_KEY", ""
        )
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=self._timeout) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            logger.error("Multimodal service HTTP %s: %s", exc.code, body)
            return LLMResult(
                text=f"Error from multimodal service: HTTP {exc.code}",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                model=model_name,
                provider=self.provider,
                raw_usage={"error": body, "http_status": exc.code},
                estimated=True,
            )
        except urllib.error.URLError as exc:
            logger.error("Multimodal service unreachable at %s: %s", url, exc)
            return LLMResult(
                text="Error: multimodal AI service is unavailable.",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                model=model_name,
                provider=self.provider,
                raw_usage={"error": str(exc.reason if hasattr(exc, "reason") else exc)},
                estimated=True,
            )

        text = (data.get("response_text") or data.get("text") or "").strip()
        prompt_tokens = int(data.get("prompt_tokens") or 0)
        completion_tokens = int(data.get("completion_tokens") or 0)
        total_tokens = int(data.get("total_tokens") or (prompt_tokens + completion_tokens))
        response_model = data.get("model") or model_name
        response_provider = data.get("provider") or self.provider
        estimated = bool(data.get("estimated", False))

        raw_usage = data.get("usage") if isinstance(data.get("usage"), dict) else {}
        if not raw_usage and (prompt_tokens or completion_tokens):
            raw_usage = {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
            }

        return LLMResult(
            text=text or "Error: empty response from multimodal service.",
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            model=response_model,
            provider=response_provider,
            raw_usage=raw_usage,
            estimated=estimated,
        )
