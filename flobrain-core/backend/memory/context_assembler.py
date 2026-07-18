"""
context_assembler.py — Lossless Context Cascade (Tier 1 -> Tier 2 -> Tier 3).

P1.W2.06 patch: assemble_context() now calls smc.get_profile() at start.
On success, profile.static facts are added as the first text block.
On failure (timeout, 5xx, stub mode) — log warning and continue without profile.

Other improvements:
  - Relevance decay boost: r = r * 0.99 + 0.01 for retrieved nodes.
  - Audit log: MongoDB insert of (user_id, node_id, query, tier) per access.
  - Auto-embeds the query text if query_embedding is None.
  - Sliding-window slicing by line to preserve code/log syntax under tight budgets.
"""
import logging
import hashlib
import tiktoken
from typing import List, Dict, Any, Tuple, Set, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.utils import timezone
from django.db import transaction
from django.db.models import F

from .models import MemoryNode, MemoryLink
from .tier_1 import active_memory_service
from .tier_2 import hybrid_search
from .tier_3 import retrieve_from_cold_storage
from .embeddings import embedding_service
from . import supermemory_connector as smc

logger = logging.getLogger(__name__)

RELEVANCE_BOOST = 0.01
RELEVANCE_DECAY = 0.99


def _audit_access(owner_id: str, node_ids: List[str], query_text: str, tier_map: Dict[str, int]):
    """Best-effort audit log of memory access. Non-blocking on failure."""
    try:
        from .mongo_client import db as mongo_db
        now = timezone.now()
        docs = [
            {
                "user_id": owner_id,
                "node_id": nid,
                "query_text": (query_text or "")[:500],
                "tier_level": tier_map.get(nid),
                "accessed_at": now,
            }
            for nid in node_ids
        ]
        if docs:
            mongo_db.memory_access_log.insert_many(docs, ordered=False)
    except Exception as e:
        logger.debug(f"[Audit Access] Failed to log {len(node_ids)} accesses: {e}")


def _format_profile_block(profile_data: Dict[str, Any]) -> str:
    """Formats SuperMemory profile response into a text block for context injection."""
    profile = profile_data.get("profile", {}) if isinstance(profile_data, dict) else {}
    static_facts = profile.get("static", []) if isinstance(profile, dict) else []
    dynamic_facts = profile.get("dynamic", []) if isinstance(profile, dict) else []

    lines = ["[USER PROFILE]"]
    if static_facts:
        lines.append("Static facts:")
        for fact in static_facts[:20]:  # cap at 20 facts
            if isinstance(fact, dict):
                content = fact.get("content") or fact.get("fact") or str(fact)
                lines.append(f"  - {content}")
            else:
                lines.append(f"  - {fact}")
    if dynamic_facts:
        lines.append("Dynamic facts (recent):")
        for fact in dynamic_facts[:10]:
            if isinstance(fact, dict):
                content = fact.get("content") or fact.get("fact") or str(fact)
                lines.append(f"  - {content}")
            else:
                lines.append(f"  - {fact}")
    if not static_facts and not dynamic_facts:
        return ""  # No profile content — skip
    return "\n".join(lines)


class LosslessContextAssembler:
    """Dispatcher for cascading context assembly across all memory tiers."""

    def __init__(self, max_context_tokens: int = 8192, model_name: str = "gpt-4", max_workers: int = 10):
        self.max_context_tokens = max_context_tokens
        self.max_workers = max_workers
        try:
            self.encoder = tiktoken.encoding_for_model(model_name)
        except Exception:
            self.encoder = tiktoken.get_encoding("cl100k_base")
        logger.info(f"[Assembler] Initialized with limit {max_context_tokens} tokens for model {model_name}.")

    def assemble_context(
        self,
        query_text: str,
        owner_id: str,
        query_embedding: Optional[List[float]] = None,
        budget: Optional[int] = None,
        top_n: int = 10
    ) -> Tuple[str, List[str], int]:
        if budget is None:
            budget = self.max_context_tokens

        if not query_embedding or all(v == 0 for v in query_embedding):
            query_embedding = embedding_service.embed(query_text or "")

        text_blocks: List[str] = []
        collected_ids: List[str] = []
        current_tokens = 0

        # =====================================================================
        # P1.W2.06 — SuperMemory profile enrichment (FIRST BLOCK)
        # =====================================================================
        try:
            profile_data = smc.get_profile(owner_id=owner_id, q=query_text)
            profile_block = _format_profile_block(profile_data)
            if profile_block:
                profile_tokens = len(self.encoder.encode(profile_block))
                if profile_tokens <= budget:
                    text_blocks.append(profile_block)
                    current_tokens += profile_tokens
                    logger.debug(f"[Assembler] Profile block injected: {profile_tokens} tokens")
        except Exception as e:
            logger.warning(f"[Assembler] get_profile failed (continuing without profile): {e}")

        # =====================================================================
        # Cascade through Tier 1 → 2 → 3
        # =====================================================================
        seen_node_ids: Set[str] = set()
        all_candidates: List[MemoryNode] = []

        tier1_nodes = list(MemoryNode.objects.filter(
            owner_id=owner_id,
            tier_level=1
        ).order_by('-updated_at')[:top_n])

        for node in tier1_nodes:
            if node.id not in seen_node_ids:
                seen_node_ids.add(node.id)
                all_candidates.append(node)

        tier2_node_ids = hybrid_search(
            query_text,
            query_embedding,
            owner_id=owner_id,
            top_n=top_n
        )
        if tier2_node_ids:
            tier2_nodes = MemoryNode.objects.filter(id__in=tier2_node_ids)
            tier2_map = {n.id: n for n in tier2_nodes}
            for nid in tier2_node_ids:
                if nid in tier2_map and nid not in seen_node_ids:
                    seen_node_ids.add(nid)
                    all_candidates.append(tier2_map[nid])

        tier3_nodes = list(MemoryNode.objects.filter(
            owner_id=owner_id,
            tier_level=3
        ).order_by('-updated_at')[:top_n])

        for node in tier3_nodes:
            if node.id not in seen_node_ids:
                seen_node_ids.add(node.id)
                all_candidates.append(node)

        tier3_candidates = [n for n in all_candidates if n.tier_level == 3]
        tier3_hydrated_data: Dict[str, str] = {}

        if tier3_candidates:
            logger.info(f"[Assembler] Found {len(tier3_candidates)} Tier 3 archive nodes. Launching async batch download...")

            def _fetch_node_payload(node: MemoryNode) -> Tuple[str, str]:
                try:
                    res = retrieve_from_cold_storage(node)
                    if res and "metadata" in res and "raw_text" in res["metadata"]:
                        return node.id, res["metadata"]["raw_text"]
                    return node.id, (node.metadata or {}).get("raw_text", "")
                except Exception as e:
                    logger.error(f"[Assembler] Critical error downloading node {node.id}: {e}")
                    return node.id, (node.metadata or {}).get("raw_text", "")

            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                future_to_node = {executor.submit(_fetch_node_payload, n): n for n in tier3_candidates}
                for future in as_completed(future_to_node):
                    node_id, raw_text = future.result()
                    tier3_hydrated_data[node_id] = raw_text

        tier_map: Dict[str, int] = {n.id: n.tier_level for n in all_candidates}

        for node in all_candidates:
            if node.tier_level == 1:
                block_content = self._read_tier1_payload(node)
            elif node.tier_level == 3:
                block_content = tier3_hydrated_data.get(node.id, "")
                if not block_content:
                    block_content = (node.metadata or {}).get("raw_text", "")
            else:
                block_content = (node.metadata or {}).get("raw_text", "")

            if not block_content:
                continue

            block_tokens = len(self.encoder.encode(block_content))

            if current_tokens + block_tokens <= budget:
                text_blocks.append(block_content)
                collected_ids.append(node.id)
                current_tokens += block_tokens
            else:
                sliced_text, sliced_tokens = self._slice_to_fit(block_content, budget - current_tokens)
                if sliced_tokens > 0:
                    text_blocks.append(sliced_text)
                    collected_ids.append(node.id)
                    current_tokens += sliced_tokens
                break

        if collected_ids:
            self._boost_relevance(collected_ids)
            _audit_access(owner_id, collected_ids, query_text, tier_map)

        return "\n".join(text_blocks), collected_ids, current_tokens

    def _boost_relevance(self, node_ids: List[str]) -> None:
        try:
            with transaction.atomic():
                MemoryNode.objects.filter(id__in=node_ids).update(
                    relevance=F('relevance') * RELEVANCE_DECAY + RELEVANCE_BOOST,
                    updated_at=timezone.now(),
                )
        except Exception as e:
            logger.warning(f"[Assembler] Relevance boost failed: {e}")

    def _read_tier1_payload(self, node: MemoryNode) -> str:
        try:
            payload = active_memory_service.get_node_data(node.id)
            if payload and isinstance(payload, dict):
                metadata = payload.get("metadata") or {}
                if isinstance(metadata, dict):
                    raw_text = metadata.get("raw_text", "")
                    if raw_text:
                        return raw_text
            orm_metadata = getattr(node, 'metadata', None) or {}
            if isinstance(orm_metadata, dict):
                return orm_metadata.get("raw_text", "")
            return ""
        except Exception as e:
            logger.warning(f"[Assembler] Error reading Tier 1 payload for node {node.id}: {e}. Fallback to ORM metadata.")
            orm_metadata = getattr(node, 'metadata', None) or {}
            if isinstance(orm_metadata, dict):
                return orm_metadata.get("raw_text", "")
            return ""

    def _slice_to_fit(self, text: str, max_tokens: int) -> Tuple[str, int]:
        tokens = self.encoder.encode(text)
        if len(tokens) <= max_tokens:
            return text, len(tokens)

        lines = text.split('\n')
        current_text_lines: List[str] = []
        current_tokens = 0

        for line in lines:
            line_with_nl = line + '\n'
            line_tokens = len(self.encoder.encode(line_with_nl))
            if current_tokens + line_tokens <= max_tokens:
                current_text_lines.append(line_with_nl)
                current_tokens += line_tokens
            else:
                break

        return "".join(current_text_lines).strip(), current_tokens
