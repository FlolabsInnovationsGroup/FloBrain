import json
import logging
import os
import urllib.error
import urllib.request
import uuid

from django.conf import settings

from .base import LLMResult

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


class MultimodalLLMAdapter:
    """
    Calls the deployed multimodal AI service.

    Endpoint: POST {MULTIMODAL_SERVICE_URL}/process
    Body:     multipart/form-data  { text_input: "<prompt>" }
    Auth:     Bearer {MULTIMODAL_API_KEY}  (if key is set)

    Response fields used: result, model, file_type
    """

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
        if not self._base_url:
            logger.error("MULTIMODAL_SERVICE_URL is not configured")
            return LLMResult(
                generated_response="Error: multimodal service URL is not configured.",
                model=model or "unknown",
                file_type="text",
            )

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
                generated_response=f"Error from multimodal service: HTTP {exc.code}",
                model=model or "unknown",
                file_type="text",
            )
        except urllib.error.URLError as exc:
            reason = str(getattr(exc, "reason", exc))
            logger.error("Multimodal service unreachable at %s: %s", url, reason)
            return LLMResult(
                generated_response="Error: multimodal AI service is unavailable.",
                model=model or "unknown",
                file_type="text",
            )

        generated_response = (data.get("result") or "").strip()
        resolved_model = data.get("model") or model or "unknown"
        file_type = data.get("file_type") or "text"

        return LLMResult(
            generated_response=generated_response or "Error: empty response from multimodal service.",
            model=resolved_model,
            file_type=file_type,
        )
