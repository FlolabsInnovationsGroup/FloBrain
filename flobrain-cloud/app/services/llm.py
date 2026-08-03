import logging
from dataclasses import dataclass, field
from typing import Any

from openai import OpenAI, OpenAIError

from app.core.config import settings

logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None


@dataclass
class LLMResult:
    text: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    model: str = "gpt-3.5-turbo"
    provider: str = "openai"
    raw_usage: dict[str, Any] = field(default_factory=dict)
    estimated: bool = False


def generate_response(messages: list, model="gpt-3.5-turbo") -> LLMResult:
    if not client:
        return LLMResult(text="Error: OpenAI API key not configured.")

    try:
        chat = client.chat.completions.create(model=model, messages=messages)
        content = chat.choices[0].message.content
        text = content.strip() if content else ""

        usage = chat.usage
        if usage:
            prompt_tokens = usage.prompt_tokens or 0
            completion_tokens = usage.completion_tokens or 0
            total_tokens = usage.total_tokens or (prompt_tokens + completion_tokens)
            raw_usage = usage.model_dump() if hasattr(usage, "model_dump") else {}
            estimated = False
        else:
            prompt_tokens = completion_tokens = 0
            total_tokens = 0
            raw_usage = {"source": "estimated", "reason": "no_usage_in_response"}
            estimated = True
            logger.warning("OpenAI response missing usage object")

        return LLMResult(
            text=text,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            model=model,
            provider="openai",
            raw_usage=raw_usage,
            estimated=estimated,
        )
    except OpenAIError as e:
        logger.error("LLM generation failed: %s", e)
        return LLMResult(text=f"Error generating response: {e!s}")
