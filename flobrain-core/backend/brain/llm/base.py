from dataclasses import dataclass
from typing import Protocol


@dataclass
class LLMResult:
    generated_response: str
    model: str
    file_type: str = "text"
    total_tokens: int = 0
    provider_request_id: str | None = None


class LLMAdapter(Protocol):
    def generate(self, messages: list[dict], model: str | None = None) -> LLMResult:
        ...
