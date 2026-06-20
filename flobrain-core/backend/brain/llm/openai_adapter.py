import logging
import os

from django.conf import settings

from usage.models import TokenUsageRecord

from .base import LLMResult
from .mock_adapter import MockLLMAdapter
from .token_counter import count_messages_tokens, count_tokens

logger = logging.getLogger(__name__)

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None  # type: ignore[misc, assignment]


class OpenAILLMAdapter:
    provider = TokenUsageRecord.PROVIDER_OPENAI

    def __init__(self) -> None:
        api_key = getattr(settings, "OPENAI_API_KEY", "") or os.environ.get("OPENAI_API_KEY", "")
        self._client = OpenAI(api_key=api_key) if OpenAI and api_key else None

    def generate(self, messages: list[dict[str, str]], model: str | None = None) -> LLMResult:
        model_name = model or getattr(settings, "LLM_DEFAULT_MODEL", "gpt-3.5-turbo")

        if not self._client:
            logger.warning("OpenAI API key not configured; falling back to mock adapter")
            return MockLLMAdapter().generate(messages, model_name)

        try:
            response = self._client.chat.completions.create(model=model_name, messages=messages)
            content = response.choices[0].message.content or ""
            text = content.strip()

            usage = response.usage
            if usage:
                prompt_tokens = usage.prompt_tokens or 0
                completion_tokens = usage.completion_tokens or 0
                total_tokens = usage.total_tokens or (prompt_tokens + completion_tokens)
                raw_usage = usage.model_dump() if hasattr(usage, "model_dump") else {}
                estimated = False
            else:
                prompt_tokens = count_messages_tokens(messages, model_name)
                completion_tokens = count_tokens(text, model_name)
                total_tokens = prompt_tokens + completion_tokens
                raw_usage = {"source": "estimated", "reason": "no_usage_in_response"}
                estimated = True
                logger.warning("OpenAI response missing usage object; using tiktoken estimate")

            return LLMResult(
                text=text,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                model=model_name,
                provider=self.provider,
                raw_usage=raw_usage,
                estimated=estimated,
            )
        except Exception as exc:
            logger.error("OpenAI LLM generation failed: %s", exc)
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
