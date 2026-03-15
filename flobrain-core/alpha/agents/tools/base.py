from __future__ import annotations

import logging
from collections.abc import Callable, Coroutine
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class ToolResult:
    """The outcome of executing a tool."""
    success: bool
    data: Any = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {"success": self.success, "data": self.data, "error": self.error}


@dataclass
class Tool:
    """
    Descriptor for an agent tool.

    Attributes:
        name:        Machine-readable identifier used to call the tool.
        description: Human-readable description shown to the LLM.
        function:    Async callable that implements the tool.
        parameters:  JSON Schema object describing the tool's kwargs.
    """

    name: str
    description: str
    function: Callable[..., Coroutine[Any, Any, Any]] = field(repr=False)
    parameters: dict[str, Any] = field(default_factory=dict)

    async def execute(self, **kwargs: Any) -> ToolResult:
        """
        Call the underlying function and wrap the result in ToolResult.

        Any exception is caught and returned as a failed ToolResult.
        """
        try:
            result = await self.function(**kwargs)
            return ToolResult(success=True, data=result)
        except Exception as exc:
            logger.exception("Tool '%s' raised an error: %s", self.name, exc)
            return ToolResult(success=False, error=str(exc))

    def to_openai_schema(self) -> dict[str, Any]:
        """Return the tool in OpenAI function-calling format."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }
