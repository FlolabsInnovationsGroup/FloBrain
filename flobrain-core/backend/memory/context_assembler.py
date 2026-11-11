import logging
import math
import re
import tiktoken
from typing import List, Optional, Tuple
from django.conf import settings

from .models import MemoryNode
from .tier_2 import retrieve_memories
from .tier_3 import retrieve_from_cold_storage

logger = logging.getLogger(__name__)

# Delimiters marking memory as reference data, not instructions (I5). Counted in the budget.
MEMORY_BLOCK_OPEN = "<user_memories>"
MEMORY_BLOCK_CLOSE = "</user_memories>"
MEMORY_LINE_PREFIX = "- "

_tiktoken_encoder = None


def _estimate_tokens(text: str) -> int:
    """Offline, conservative count: never below one token per 3 UTF-8 bytes or per word/symbol."""
    if not text:
        return 0
    return max(math.ceil(len(text.encode("utf-8")) / 3), len(re.findall(r"\w+|[^\w\s]", text)))


def _get_tiktoken_encoder():
    global _tiktoken_encoder
    if _tiktoken_encoder is None:
        try:
            _tiktoken_encoder = tiktoken.get_encoding("cl100k_base")
        except Exception as e:
            logger.warning(f"[Assembler] tiktoken unavailable ({e}); using the offline estimate.")
            return None
    return _tiktoken_encoder


def count_tokens(text: str) -> int:
    """Token count used for every memory budget decision.

    MEMORY_TOKENIZER="tiktoken" uses cl100k_base when its data can be loaded (it may
    download on first use); anything else, or a load failure, uses the offline estimate.
    """
    if settings.MEMORY_TOKENIZER == "tiktoken":
        encoder = _get_tiktoken_encoder()
        if encoder is not None:
            return len(encoder.encode(text))
    return _estimate_tokens(text)


def render_memory_block(contents: List[str]) -> str:
    if not contents:
        return ""
    lines = [MEMORY_LINE_PREFIX + " ".join(c.split()) for c in contents]
    return "\n".join([MEMORY_BLOCK_OPEN, *lines, MEMORY_BLOCK_CLOSE])


class LosslessContextAssembler:
    """Builds the budgeted memory block for one query, from owner-scoped retrieval only."""

    def __init__(self, max_context_tokens: Optional[int] = None):
        self.max_context_tokens = max_context_tokens or settings.MEMORY_CONTEXT_TOKEN_BUDGET

    def assemble_context(
        self,
        query_text: str,
        owner_id: str,
        budget: Optional[int] = None,
        top_n: Optional[int] = None,
        exclude_ids: Optional[List[str]] = None,
    ) -> Tuple[str, List[str], int]:
        """Return (block, node_ids, tokens). The block, framing and separators included, fits the budget."""
        if budget is None:
            budget = self.max_context_tokens

        included_ids: List[str] = []
        included_contents: List[str] = []
        for node_id, content, _score in retrieve_memories(owner_id, query_text, limit=top_n, exclude_ids=exclude_ids):
            content = content or self._hydrate_archived(node_id, owner_id)
            if not content:
                continue
            # Skip (rather than truncate) a memory that does not fit; a partial fact can mislead
            if count_tokens(render_memory_block(included_contents + [content])) > budget:
                continue
            included_ids.append(node_id)
            included_contents.append(content)

        block = render_memory_block(included_contents)
        return block, included_ids, count_tokens(block)

    def _hydrate_archived(self, node_id: str, owner_id: str) -> str:
        """Read an archive-only memory through its vault_uri; only the caller's own node."""
        node = MemoryNode.objects.filter(id=node_id, owner_id=owner_id).only("metadata").first()
        vault_uri = (node.metadata or {}).get("vault_uri") if node else None
        if not vault_uri:
            return ""
        restored = retrieve_from_cold_storage(vault_uri)
        return (restored.get("metadata") or {}).get("raw_text", "")
