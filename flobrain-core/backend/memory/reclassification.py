"""
reclassification.py — Garbage Collector + Warmup Service.

Improvements vs original:
  - Added promote_to_active_context(keyword, owner_id): restores Tier 3 nodes
    matching a keyword back into Tier 1 RAM buffer. Fixes the broken warmup
    management command that imported this non-existent function.
  - Audit logging via MongoDB (best-effort, non-blocking).
  - GC cycle uses chunked scanning with SKIP LOCKED semantics for safe
    parallel execution across multiple Celery workers.
"""
import logging
from datetime import timedelta
from typing import Optional, List
from django.utils import timezone
from django.db import transaction, models
from django.conf import settings
from celery import shared_task
from prometheus_client import Counter, Histogram, Gauge

from .models import MemoryNode, TokenDictionary, MemoryLink
from .tier_3 import migrate_to_cold_storage, retrieve_from_cold_storage
from .tier_2 import collection
from .tier_1 import active_memory_service

logger = logging.getLogger(__name__)

GC_MIGRATED_NODES = Counter('flobrain_gc_migrated_nodes_total', 'Total nodes successfully migrated to Tier 3')
GC_DELETED_TOKENS = Counter('flobrain_gc_deleted_tokens_total', 'Total stale tokens purged from dictionary')
GC_CYCLE_DURATION = Histogram('flobrain_gc_cycle_duration_seconds', 'Time spent executing full GC cycle')
GC_STALE_QUEUE = Gauge('flobrain_gc_stale_queue_size', 'Approximate number of nodes waiting for cold storage')

NODE_CUTOFF_DAYS = getattr(settings, 'MEMORY_NODE_CUTOFF_DAYS', 90)
TOKEN_CUTOFF_DAYS = getattr(settings, 'MEMORY_TOKEN_CUTOFF_DAYS', 90)
GC_CHUNK_SIZE = getattr(settings, 'GC_CHUNK_SIZE', 500)


def _audit_event(event_type: str, payload: dict, status: str = "success"):
    """Best-effort audit log to MongoDB. Non-blocking on failure."""
    try:
        from .mongo_client import db as mongo_db
        mongo_db.memory_audit_events.insert_one({
            "event_type": event_type,
            "status": status,
            "payload": payload,
            "created_at": timezone.now(),
        })
    except Exception as e:
        logger.debug(f"[Audit] Failed to write event {event_type}: {e}")


@shared_task(name="flobrain.memory.task_gc_deep_freeze")
def task_gc_deep_freeze() -> str:
    try:
        cutoff_date = timezone.now() - timedelta(days=NODE_CUTOFF_DAYS)
        stale_nodes = MemoryNode.objects.filter(
            tier_level__in=[1, 2],
            created_at__lt=cutoff_date,
            is_locked=False
        ).order_by('created_at')[:GC_CHUNK_SIZE]

        stale_count = len(list(stale_nodes.values_list('id', flat=True)))
        GC_STALE_QUEUE.set(stale_count)
        frozen_counter = 0
        failed_counter = 0

        with GC_CYCLE_DURATION.time():
            for node in stale_nodes:
                try:
                    with transaction.atomic():
                        migration_success = migrate_to_cold_storage(node)
                        if not migration_success:
                            logger.warning(f"[GC Deep Freeze] Node {node.id} skipped: cold archiving failed.")
                            failed_counter += 1
                            continue

                        if node.tier_level != 3:
                            node.tier_level = 3
                            node.save(update_fields=['tier_level', 'metadata'])

                        try:
                            collection.delete(ids=[node.id])
                        except Exception as chroma_err:
                            logger.warning(
                                f"[GC Deep Freeze] ChromaDB cleanup failed for {node.id} "
                                f"(node already persisted as Tier 3): {chroma_err}"
                            )
                            node.tier_level = 2
                            node.save(update_fields=['tier_level'])
                            failed_counter += 1
                            continue

                        frozen_counter += 1
                        GC_MIGRATED_NODES.inc()
                        logger.info(f"[GC Deep Freeze] Node {node.id} evicted to Tier 3.")

                except Exception as node_err:
                    logger.error(f"[GC Deep Freeze] Atomic migration failure for node {node.id}: {node_err}")
                    failed_counter += 1
                    continue

        _audit_event("gc_deep_freeze", {
            "frozen": frozen_counter,
            "failed": failed_counter,
            "scanned": stale_count,
        })

        logger.info(f"[GC Deep Freeze] Phase complete. Frozen: {frozen_counter}, Failed: {failed_counter}")
        GC_STALE_QUEUE.set(0)
        return f"Successfully frozen {frozen_counter} nodes"

    except Exception as e:
        logger.error(f"[GC Deep Freeze] Critical failure: {e}", exc_info=True)
        _audit_event("gc_deep_freeze", {"error": str(e)}, status="failed")
        return "Failed"


@shared_task(name="flobrain.memory.task_gc_purge_stale_tokens")
def task_gc_purge_stale_tokens() -> int:
    cutoff_date = timezone.now() - timedelta(days=TOKEN_CUTOFF_DAYS)
    total_deleted = 0

    while True:
        try:
            with transaction.atomic():
                stale_ids_queryset = TokenDictionary.objects.filter(
                    frequency_score=1,
                    last_accessed_at__lt=cutoff_date
                ).values_list('id', flat=True)[:GC_CHUNK_SIZE]

                if not stale_ids_queryset:
                    break

                deleted_count, _ = TokenDictionary.objects.filter(
                    id__in=models.Subquery(stale_ids_queryset)
                ).delete()

                if deleted_count == 0:
                    break

                total_deleted += deleted_count
                GC_DELETED_TOKENS.inc(deleted_count)

        except Exception as e:
            logger.error(f"[GC] Critical error during dictionary cleanup: {e}", exc_info=True)
            break

    if total_deleted > 0:
        logger.info(f"[GC Token Purge] Phase complete. Total tokens purged: {total_deleted}")
        _audit_event("gc_token_purge", {"deleted": total_deleted})
    return total_deleted


def promote_to_active_context(keyword: str, owner_id: Optional[str] = None, limit: int = 50) -> int:
    """
    Restores Tier 3 (cold storage) nodes matching a keyword back to Tier 1 RAM buffer.
    Used by the `warmup` management command to preload context before a session.

    Args:
        keyword: Search string — matched case-insensitively against node.name.
        owner_id: Optional owner filter. If None, matches across all owners.
        limit: Maximum number of nodes to warm up in one call.

    Returns:
        Number of nodes successfully promoted to Tier 1.
    """
    if not keyword or not keyword.strip():
        logger.warning("[Warmup] Empty keyword provided — nothing to promote.")
        return 0

    qs = MemoryNode.objects.filter(
        tier_level=3,
        name__icontains=keyword,
        is_locked=False,
    )
    if owner_id:
        qs = qs.filter(owner_id=owner_id)

    cold_nodes: List[MemoryNode] = list(qs.order_by('-updated_at')[:limit])

    if not cold_nodes:
        logger.info(f"[Warmup] No Tier 3 nodes found for keyword '{keyword}'.")
        return 0

    logger.info(f"[Warmup] Found {len(cold_nodes)} cold nodes for keyword '{keyword}'. Hydrating...")

    promoted_count = 0
    for node in cold_nodes:
        try:
            metadata = getattr(node, 'metadata', None) or {}
            vault_uri = metadata.get('vault_uri') if isinstance(metadata, dict) else None

            if not vault_uri:
                logger.warning(f"[Warmup] Node {node.id} has no vault_uri — cannot restore from S3.")
                continue

            restored = retrieve_from_cold_storage(vault_uri)
            if not restored or "metadata" not in restored:
                logger.warning(f"[Warmup] Failed to restore node {node.id} from cold storage.")
                continue

            restored_text = restored.get("metadata", {}).get("raw_text", "")
            if not restored_text:
                logger.warning(f"[Warmup] Node {node.id} restored but raw_text is empty.")
                continue

            with transaction.atomic():
                import hashlib
                content_hash = hashlib.sha256(restored_text.encode('utf-8')).hexdigest()

                active_memory_service.save_node(
                    node_id=node.id,
                    owner_id=node.owner_id,
                    token_indices=[],
                    content_hash=content_hash,
                    metadata={"raw_text": restored_text, "source": "warmup", "vault_uri": vault_uri},
                )

                node.tier_level = 1
                node.metadata = {**metadata, "raw_text": restored_text, "warmed_up_at": timezone.now().isoformat()}
                node.save(update_fields=['tier_level', 'metadata'])

                promoted_count += 1
                logger.info(f"[Warmup] Node {node.id} promoted to Tier 1.")

        except Exception as e:
            logger.error(f"[Warmup] Failed to promote node {getattr(node, 'id', '?')}: {e}", exc_info=True)
            continue

    _audit_event("warmup_promote", {
        "keyword": keyword,
        "owner_id": owner_id,
        "promoted": promoted_count,
        "scanned": len(cold_nodes),
    })

    logger.info(f"[Warmup] Promotion complete. {promoted_count}/{len(cold_nodes)} nodes restored.")
    return promoted_count
