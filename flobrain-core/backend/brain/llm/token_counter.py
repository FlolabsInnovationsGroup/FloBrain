import logging

logger = logging.getLogger(__name__)

try:
    import tiktoken
except ImportError:  # pragma: no cover
    tiktoken = None  # type: ignore[assignment]


def count_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    if not text:
        return 0
    if tiktoken is None:
        return max(1, len(text) // 4)
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))


def count_messages_tokens(messages: list[dict[str, str]], model: str = "gpt-3.5-turbo") -> int:
    total = 0
    for msg in messages:
        content = msg.get("content") or ""
        total += count_tokens(content, model)
        total += 4  # role/overhead per message
    return total + 2
