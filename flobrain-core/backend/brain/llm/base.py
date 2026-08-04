from dataclasses import dataclass
from typing import Protocol


@dataclass
class LLMResult:
    generated_response: str
    model: str
    file_type: str = "text"


class LLMAdapter(Protocol):
    def generate(self, messages: list[dict[str, str]], model: str | None = None) -> LLMResult:
        ...
