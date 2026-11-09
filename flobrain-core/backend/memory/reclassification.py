import logging
from datetime import timedelta
from typing import Optional
from django.utils import timezone
from django.db import transaction, models
from django.conf import settings
from celery import shared_task
from prometheus_client import Counter, Histogram, Gauge

from .models import MemoryNode, TokenDictionary, MemoryLink
from .tier_3 import migrate_to_cold_storage
from .tier_2 import collection

logger = logging.getLogger(__name__)

GC_MIGRATED_NODES = Counter('flobrain_gc_migrated_nodes_total', 'Total nodes successfully migrated to Tier 3')
GC_DELETED_TOKENS = Counter('flobrain_gc_deleted_tokens_total', 'Total stale tokens purged from dictionary')
GC_CYCLE_DURATION = Histogram('flobrain_gc_cycle_duration_seconds', 'Time spent executing full GC cycle')
GC_STALE_QUEUE = Gauge('flobrain_gc_stale_queue_size', 'Approximate number of nodes waiting for cold storage')

NODE_CUTOFF_DAYS = getattr(settings, 'MEMORY_NODE_CUTOFF_DAYS', 90)
TOKEN_CUTOFF_DAYS = getattr(settings, 'MEMORY_TOKEN_CUTOFF_DAYS', 90)
GC_CHUNK_SIZE = getattr(settings, 'GC_CHUNK_SIZE', 500)

@shared_task(name="flobrain.memory.task_gc_deep_freeze")
def task_gc_deep_freeze() -> str:
    try:
        cutoff_date = timezone.now() - timedelta(days=NODE_CUTOFF_DAYS)
        
        stale_nodes = MemoryNode.objects.filter(
            tier_level__in=[1, 2],
            created_at__lt=cutoff_date,
            is_locked=False
        )[:GC_CHUNK_SIZE]
        
        GC_STALE_QUEUE.set(stale_nodes.count())
        frozen_counter = 0
        
        with GC_CYCLE_DURATION.time():
            for node in stale_nodes:
                try:
                    with transaction.atomic():
                        migration_success = migrate_to_cold_storage(node)
                        
                        if not migration_success:
                            logger.warning(f"[GC Deep Freeze] Node {node.id} skipped: cold archiving failed.")
                            continue
                        
                        node.tier_level = 3
                        node.save()
                        
                        collection.delete(ids=[node.id])
                        
                        frozen_counter += 1
                        GC_MIGRATED_NODES.inc()
                        logger.info(f"[GC Deep Freeze] Node {node.id} successfully evicted to Tier 3.")
                        
                except Exception as node_err:
                    logger.error(f"[GC Deep Freeze] Atomic migration failure for node {node.id}: {node_err}")
                    continue
                    
        logger.info(f"[GC Deep Freeze] Phase complete. Total nodes frozen: {frozen_counter}")
        GC_STALE_QUEUE.set(0)
        return f"Successfully frozen {frozen_counter} nodes"
        
    except Exception as e:
        logger.error(f"[GC Deep Freeze] Critical failure: {e}", exc_info=True)
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
                    
                deleted_count, _ = TokenDictionary.objects.filter(id__in=models.Subquery(stale_ids_queryset)).delete()
                
                if deleted_count == 0:
                    break
                    
                total_deleted += deleted_count
                GC_DELETED_TOKENS.inc(deleted_count)
                
        except Exception as e:
            logger.error(f"[GC] Critical error during dictionary cleanup: {e}", exc_info=True)
            break

    if total_deleted > 0:
        logger.info(f"[GC Deep Freeze] Phase complete. Total tokens purged: {total_deleted}")
    return total_deleted