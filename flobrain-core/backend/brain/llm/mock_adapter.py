from django.conf import settings

from usage.models import TokenUsageRecord

from .base import LLMResult
from .token_counter import count_messages_tokens, count_tokens


class MockLLMAdapter:
    provider = TokenUsageRecord.PROVIDER_MOCK

    def generate(self, messages: list[dict[str, str]], model: str | None = None) -> LLMResult:
        model_name = model or getattr(settings, "LLM_DEFAULT_MODEL", "gpt-3.5-turbo")
        last_user = next(
            (m["content"] for m in reversed(messages) if m.get("role") == "user"),
            "",
        )
        text = (
            f'I received your message: "{last_user[:100]}". '
            "This is a placeholder response. Connect an LLM for real replies."
        )
        prompt_tokens = count_messages_tokens(messages, model_name)
        completion_tokens = count_tokens(text, model_name)
        return LLMResult(
            text=text,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            model=model_name,
            provider=self.provider,
            raw_usage={"source": "estimated"},
            estimated=True,
        )
