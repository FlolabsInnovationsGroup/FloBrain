import logging
import os

from django.conf import settings

from usage.models import TokenUsageRecord

from .base import LLMResult
from .mock_adapter import MockLLMAdapter
from .token_counter import count_messages_tokens, count_tokens

logger = logging.getLogger(__name__)

try:
    import anthropic as anthropic_lib
except ImportError:  # pragma: no cover
    anthropic_lib = None  # type: ignore[assignment]


class AnthropicLLMAdapter:
    provider = TokenUsageRecord.PROVIDER_ANTHROPIC

    def __init__(self) -> None:
        api_key = getattr(settings, "ANTHROPIC_API_KEY", "") or os.environ.get("ANTHROPIC_API_KEY", "")
        self._client = anthropic_lib.Anthropic(api_key=api_key) if anthropic_lib and api_key else None

    def generate(self, messages: list[dict[str, str]], model: str | None = None) -> LLMResult:
        model_name = model or getattr(settings, "LLM_DEFAULT_MODEL", "claude-sonnet-4-6")

        if not self._client:
            logger.warning("Anthropic API key not configured; falling back to mock adapter")
            return MockLLMAdapter().generate(messages, model_name)

        # Anthropic separates system prompt from conversation turns
        system_content = ""
        chat_messages: list[dict[str, str]] = []
        for msg in messages:
            role = msg.get("role", "")
            content = msg.get("content", "")
            if role == "system":
                system_content = content
            elif role in ("user", "assistant"):
                chat_messages.append({"role": role, "content": content})

        try:
            create_kwargs: dict = {
                "model": model_name,
                "max_tokens": 4096,
                "messages": chat_messages,
            }
            if system_content:
                create_kwargs["system"] = system_content

            response = self._client.messages.create(**create_kwargs)

            text_block = next(
                (b for b in response.content if getattr(b, "type", None) == "text"), None
            )
            text = (text_block.text if text_block else "").strip()

            usage = response.usage
            if usage:
                prompt_tokens = int(getattr(usage, "input_tokens", 0) or 0)
                completion_tokens = int(getattr(usage, "output_tokens", 0) or 0)
                total_tokens = prompt_tokens + completion_tokens
                raw_usage = {
                    "input_tokens": prompt_tokens,
                    "output_tokens": completion_tokens,
                }
                estimated = False
            else:
                prompt_tokens = count_messages_tokens(messages, model_name)
                completion_tokens = count_tokens(text, model_name)
                total_tokens = prompt_tokens + completion_tokens
                raw_usage = {"source": "estimated", "reason": "no_usage_in_response"}
                estimated = True
                logger.warning("Anthropic response missing usage; using tiktoken estimate")

            return LLMResult(
                text=text or "Error: empty response from Anthropic.",
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                model=response.model or model_name,
                provider=self.provider,
                raw_usage=raw_usage,
                estimated=estimated,
            )

        except Exception as exc:
            logger.error("Anthropic LLM generation failed: %s", exc)
            return LLMResult(
                text=f"Error generating response: {exc}",
                prompt_tokens=count_messages_tokens(messages, model_name),
                completion_tokens=0,
                total_tokens=count_messages_tokens(messages, model_name),
                model=model_name,
                provider=self.provider,
                raw_usage={"error": str(exc)},
                estimated=True,
            )
