from dataclasses import dataclass, field
from typing import Any, Protocol


@dataclass
class LLMResult:
    text: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    model: str
    provider: str
    raw_usage: dict[str, Any] = field(default_factory=dict)
    estimated: bool = False


class LLMAdapter(Protocol):
    def generate(self, messages: list[dict[str, str]], model: str | None = None) -> LLMResult:
        ...
