import json
import logging
import os
import urllib.error
import urllib.request
import uuid

from django.conf import settings

from .base import LLMResult

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

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


def _extract_base64(data_url: str) -> str:
    if data_url.startswith("data:"):
        comma = data_url.find(",")
        if comma != -1:
            return data_url[comma + 1:]
    return data_url


def _find_latest_image(messages: list[dict]) -> str:
    for msg in reversed(messages):
        if msg.get("role") == "user" and msg.get("image"):
            return _extract_base64(msg["image"])
    return ""


def _format_messages_as_prompt(messages: list[dict]) -> str:
    role_label = {"system": "System", "user": "User", "assistant": "Assistant"}
    parts = []
    for msg in messages:
        role = msg.get("role", "")
        content = (msg.get("content") or "").strip()
        has_image = bool(msg.get("image"))
        label = role_label.get(role, role.capitalize())
        if content and has_image:
            parts.append(f"{label}: {content} [image attached]")
        elif content:
            parts.append(f"{label}: {content}")
        elif has_image:
            parts.append(f"{label}: [image attached]")
    return "\n\n".join(parts)


def _do_request(url: str, body: bytes, content_type: str, headers: dict, timeout: int) -> dict:
    """Execute an HTTP POST and return the parsed JSON body. Raises on failure."""
    all_headers = {"Content-Type": content_type, **headers}
    req = urllib.request.Request(url, data=body, headers=all_headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---------------------------------------------------------------------------
# Legacy path — calls the existing /process endpoint
# ---------------------------------------------------------------------------

class MultimodalLLMAdapter:
    """
    Calls the deployed multimodal AI service.

    When USE_CREDENTIALED_LLM is False (default) it calls the legacy /process
    endpoint. When True it calls /invoke or /transcribe with a signed request
    token and reads the key via the credential endpoint (M2 credentialed path).
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
        self._use_credentialed = bool(
            getattr(settings, "USE_CREDENTIALED_LLM", False)
            or os.environ.get("USE_CREDENTIALED_LLM", "")
        )

    def generate(self, messages: list[dict], model: str | None = None) -> LLMResult:
        if not self._base_url:
            logger.error("MULTIMODAL_SERVICE_URL is not configured")
            return LLMResult(
                generated_response="Error: multimodal service URL is not configured.",
                model=model or "unknown",
                file_type="text",
            )

        if self._use_credentialed:
            return self._generate_credentialed(messages, model)
        return self._generate_legacy(messages, model)

    # --- Legacy path ---

    def _generate_legacy(self, messages: list[dict], model: str | None) -> LLMResult:
        text_input = _format_messages_as_prompt(messages)
        url = f"{self._base_url}/process"
        fields: dict[str, str] = {"text_input": text_input}
        image_b64 = _find_latest_image(messages)
        if image_b64:
            fields["image"] = image_b64
        body, content_type = _build_multipart(fields)

        headers: dict[str, str] = {}
        api_key = getattr(settings, "MULTIMODAL_API_KEY", "") or os.environ.get(
            "MULTIMODAL_API_KEY", ""
        )
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        try:
            data = _do_request(url, body, content_type, headers, self._timeout)
        except urllib.error.HTTPError as exc:
            body_text = exc.read().decode("utf-8", errors="replace")
            logger.error("Multimodal service HTTP %s at %s: %s", exc.code, url, body_text)
            return LLMResult(
                generated_response=f"Error from multimodal service: HTTP {exc.code}",
                model=model or "unknown",
                file_type="text",
            )
        except urllib.error.URLError as exc:
            logger.error("Multimodal service unreachable at %s: %s", url, getattr(exc, "reason", exc))
            return LLMResult(
                generated_response="Error: multimodal AI service is unavailable.",
                model=model or "unknown",
                file_type="text",
            )

        return LLMResult(
            generated_response=(data.get("result") or "").strip()
                or "Error: empty response from multimodal service.",
            model=data.get("model") or model or "unknown",
            file_type=data.get("file_type") or "text",
            total_tokens=int(data.get("total_tokens") or 0),
        )

    # --- Credentialed path (M2) ---

    def _generate_credentialed(self, messages: list[dict], model: str | None) -> LLMResult:
        """
        Calls POST /invoke with a signed request token (B-7).
        The multimodal service verifies the token, fetches the key from our
        credential endpoint, calls the provider, and returns the result.
        No silent fallback to the legacy path.
        """
        from keys.token_service import issue_token
        from keys.models import ProviderCredential

        # Resolve the platform credential for this request.
        # In a real flow the caller passes user/credential context; here we use
        # the platform key as the default until user key selection is wired up.
        cred = (
            ProviderCredential.objects.filter(
                source=ProviderCredential.SOURCE_PLATFORM,
                provider=ProviderCredential.PROVIDER_OPENAI,
            )
            .prefetch_related("versions")
            .first()
        )

        if not cred:
            logger.error("No platform OpenAI credential configured for credentialed LLM path")
            return LLMResult(
                generated_response="Error: AI provider not configured.",
                model=model or "unknown",
                file_type="text",
            )

        active = cred.active_version()
        if not active:
            logger.error("Platform credential %s has no active version", cred.id)
            return LLMResult(
                generated_response="Error: AI provider credential is not active.",
                model=model or "unknown",
                file_type="text",
            )

        resolved_model = model or "gpt-4o-mini"
        targets = [t for t in active.permitted_targets if t.get("model") == resolved_model]
        if not targets:
            targets = [{"operation": "generate_text", "model": resolved_model}]

        try:
            token = issue_token(
                scope_id=cred.scope_id,
                credential_ref=str(cred.id),
                credential_version=active.version,
                credential_source=cred.source,
                provider=cred.provider,
                kind="invoke",
                targets=targets,
            )
        except RuntimeError as exc:
            logger.error("Token issue failed: %s", exc)
            return LLMResult(
                generated_response="Error: AI provider not configured.",
                model=resolved_model,
                file_type="text",
            )

        url = f"{self._base_url}/invoke"
        payload_json = json.dumps(
            {"text": _format_messages_as_prompt(messages), "generation_model": resolved_model}
        ).encode("utf-8")

        try:
            data = _do_request(
                url,
                payload_json,
                "application/json",
                {"Authorization": f"Bearer {token}"},
                self._timeout,
            )
        except urllib.error.HTTPError as exc:
            body_text = exc.read().decode("utf-8", errors="replace")
            logger.error("Credentialed multimodal HTTP %s at %s: %s", exc.code, url, body_text)
            return LLMResult(
                generated_response=f"Error from AI provider: HTTP {exc.code}",
                model=resolved_model,
                file_type="text",
            )
        except urllib.error.URLError as exc:
            logger.error("Credentialed multimodal unreachable at %s: %s", url, getattr(exc, "reason", exc))
            return LLMResult(
                generated_response="Error: AI service is unavailable.",
                model=resolved_model,
                file_type="text",
            )

        return LLMResult(
            generated_response=(data.get("result") or "").strip()
                or "Error: empty response from AI service.",
            model=data.get("model") or resolved_model,
            file_type=data.get("file_type") or "text",
            total_tokens=int(data.get("total_tokens") or 0) if data.get("total_tokens") is not None else 0,
            provider_request_id=data.get("provider_request_id"),
        )
