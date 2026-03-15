from __future__ import annotations

from agents.tools.base import Tool


async def _web_search(query: str) -> str:
    """Placeholder web search — not yet implemented."""
    return (
        f"Web search for '{query}' is not yet implemented in this alpha build. "
        "Please use Notion search or ask me to answer from my training data."
    )


web_search = Tool(
    name="web_search",
    description=(
        "Search the web for current information. "
        "NOTE: This is a placeholder — actual web search is not implemented in the alpha."
    ),
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The search query."},
        },
        "required": ["query"],
    },
    function=_web_search,
)

ALL_WEB_TOOLS: list[Tool] = [web_search]
