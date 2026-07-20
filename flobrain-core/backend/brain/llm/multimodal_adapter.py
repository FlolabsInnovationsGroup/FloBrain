import json
import logging
import os
import urllib.error
import urllib.request
import uuid

from django.conf import settings

from usage.models import TokenUsageRecord

from .base import LLMResult
from .mock_adapter import MockLLMAdapter

logger = logging.getLogger(__name__)


def _build_multipart(fields: dict[str, str]) -> tuple[bytes, str]:
    """Encode a dict of string fields as multipart/form-data."""
    boundary = uuid.uuid4().hex
    lines: list[str] = []
    for name, value in fields.items():
        lines += [
            f"--{boundary}",
            f'Content-Disposition: form-data; name="{name}"',
            "",
            value,
        ]
    lines.append(f"--{boundary}--")
    body = "\r\n".join(lines).encode("utf-8")
    return body, f"multipart/form-data; boundary={boundary}"


def _format_messages_as_prompt(messages: list[dict[str, str]]) -> str:
    """Flatten an OpenAI-style messages array into a single text prompt."""
    role_label = {"system": "System", "user": "User", "assistant": "Assistant"}
    parts = []
    for msg in messages:
        role = msg.get("role", "")
        content = (msg.get("content") or "").strip()
        if content:
            label = role_label.get(role, role.capitalize())
            parts.append(f"{label}: {content}")
    return "\n\n".join(parts)


def _extract_int(data: dict, *keys: str) -> int:
    for key in keys:
        val = data.get(key)
        if val is not None:
            try:
                return int(val)
            except (TypeError, ValueError):
                pass
    return 0


class MultimodalLLMAdapter:
    """
    Calls the deployed multimodal AI service.

    Endpoint: POST {MULTIMODAL_SERVICE_URL}/process
    Body:     multipart/form-data  { text_input: "<prompt>" }
    Auth:     Bearer {MULTIMODAL_API_KEY}  (if key is set)
    """

    provider = TokenUsageRecord.PROVIDER_OPENAI

    def __init__(self) -> None:
        base_url = getattr(settings, "MULTIMODAL_SERVICE_URL", None) or os.environ.get(
            "MULTIMODAL_SERVICE_URL", ""
        )
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

        text_input = _format_messages_as_prompt(messages)
        url = f"{self._base_url}/process"
        body, content_type = _build_multipart({"text_input": text_input})

        headers: dict[str, str] = {"Content-Type": content_type}
        api_key = getattr(settings, "MULTIMODAL_API_KEY", "") or os.environ.get(
            "MULTIMODAL_API_KEY", ""
        )
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        req = urllib.request.Request(url, data=body, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                raw = resp.read().decode("utf-8")
                data: dict = json.loads(raw)
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="replace")
            logger.error("Multimodal service HTTP %s at %s: %s", exc.code, url, error_body)
            return LLMResult(
                text=f"Error from multimodal service: HTTP {exc.code}",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                model=model_name,
                provider=self.provider,
                raw_usage={"error": error_body, "http_status": exc.code},
                estimated=True,
            )
        except urllib.error.URLError as exc:
            reason = str(getattr(exc, "reason", exc))
            logger.error("Multimodal service unreachable at %s: %s", url, reason)
            return LLMResult(
                text="Error: multimodal AI service is unavailable.",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                model=model_name,
                provider=self.provider,
                raw_usage={"error": reason},
                estimated=True,
            )

        # Extract generated text — "result" is the field this service uses
        text = (
            data.get("result")
            or data.get("response_text")
            or data.get("text")
            or data.get("output")
            or data.get("response")
            or data.get("generated_text")
            or ""
        ).strip()

        # Extract token counts from the /process response
        prompt_tokens = _extract_int(data, "prompt_tokens", "input_tokens")
        completion_tokens = _extract_int(data, "completion_tokens", "output_tokens")
        total_tokens = _extract_int(data, "total_tokens") or (prompt_tokens + completion_tokens)
        estimated = bool(data.get("estimated", total_tokens == 0))

        _usage_val = data.get("usage")
        raw_usage: dict = _usage_val if isinstance(_usage_val, dict) else {}
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
            model=data.get("model") or model_name,
            provider=self.provider,
            raw_usage=raw_usage,
            estimated=estimated,
        )
