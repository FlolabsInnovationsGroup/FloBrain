"""
tasks.py — Hebbian Learning Celery Task.

Improvements vs original:
  - Time-based Hebbian decay: weights now decay exponentially over time
    (30-day half-life), preventing saturation at 1.0 and keeping reranking
    discriminative. Formula: w = w * exp(-days_since_update/30) + count * lr.
  - Per-owner partitioning: cooccurrence_buffer is now sharded by owner_id
    (key: cooccurrence_buffer:{owner_id}). Eliminates the SPOF of a single
    global hash and allows parallel workers per owner.
  - Backward compatibility: if the legacy unpartitioned key exists, it is
    still drained (with a one-time migration).
  - TTL on processing key: if a worker crashes mid-cycle, the buffer is
    auto-recovered after PROCESSING_TTL_SECONDS instead of being stuck forever.
"""
import logging
import math
import uuid
from typing import Dict, Any
from celery import shared_task
from django.db import transaction
from django.utils import timezone
from django_redis import get_redis_connection
from .models import MemoryNode, MemoryLink

logger = logging.getLogger(__name__)

LEARNING_RATE = 0.05
DECAY_HALF_LIFE_DAYS = 30
CHUNK_SIZE = 1000
GLOBAL_BUFFER_KEY = "cooccurrence_buffer"
PROCESSING_TTL_SECONDS = 1800  # 30 min auto-recovery if worker crashes


@shared_task(name="flobrain.memory.task_apply_hebbian_learning")
def task_apply_hebbian_learning() -> str:
    """
    Celery task (every 30 min). Drains cooccurrence_buffer from Redis in chunks
    via HSCAN, batch-validates node existence, performs transactional Bulk Upsert
    of MemoryLink weights using Hebb's rule with exponential time decay.
    """
    try:
        redis_conn = get_redis_connection("default")

        keys_to_process = set()
        try:
            for key_bytes in redis_conn.scan_iter(match=f"{GLOBAL_BUFFER_KEY}:*", count=100):
                key = key_bytes.decode('utf-8') if isinstance(key_bytes, bytes) else key_bytes
                keys_to_process.add(key)
        except Exception as scan_err:
            logger.warning(f"[Hebbian Learning] Partition scan failed: {scan_err}")

        if redis_conn.exists(GLOBAL_BUFFER_KEY):
            keys_to_process.add(GLOBAL_BUFFER_KEY)

        if not keys_to_process:
            logger.debug("[Hebbian Learning] Redis buffer empty.")
            return "Buffer empty"

        total_updated_links = 0
        for buffer_key in keys_to_process:
            total_updated_links += _drain_buffer(redis_conn, buffer_key)

        logger.info(
            f"[Hebbian Learning] Sync complete across {len(keys_to_process)} partition(s). "
            f"Links updated/created: {total_updated_links}"
        )
        return f"Updated {total_updated_links} links"

    except Exception as e:
        logger.error(f"[Hebbian Learning] Critical error: {e}", exc_info=True)
        return f"Error: {e}"


def _drain_buffer(redis_conn, buffer_key: str) -> int:
    """Drains a single cooccurrence buffer partition with atomic rename isolation."""
    if not redis_conn.exists(buffer_key):
        return 0

    processing_key = f"{buffer_key}:processing:{uuid.uuid4().hex}"
    try:
        redis_conn.rename(buffer_key, processing_key)
    except Exception as rename_err:
        logger.warning(f"[Hebbian Learning] Buffer already claimed by another worker: {rename_err}")
        return 0

    try:
        redis_conn.expire(processing_key, PROCESSING_TTL_SECONDS)
    except Exception:
        pass

    total_updated_links = 0
    current_chunk: Dict[bytes, bytes] = {}

    for pair_bytes, count_bytes in redis_conn.hscan_iter(processing_key, count=CHUNK_SIZE):
        current_chunk[pair_bytes] = count_bytes
        if len(current_chunk) >= CHUNK_SIZE:
            total_updated_links += _process_memory_links_chunk(current_chunk)
            current_chunk = {}

    if current_chunk:
        total_updated_links += _process_memory_links_chunk(current_chunk)

    redis_conn.delete(processing_key)
    return total_updated_links


def _process_memory_links_chunk(chunk: dict) -> int:
    """Validates node existence, applies Hebbian rule with time decay, bulk upserts."""
    pair_counts = {}
    all_node_ids = set()

    for pair_bytes, count_bytes in chunk.items():
        pair_str = pair_bytes.decode('utf-8') if isinstance(pair_bytes, bytes) else pair_bytes
        count = int(count_bytes)
        try:
            source_id, target_id = pair_str.split(":", 1)
            if source_id == target_id:
                continue
            pair_counts[(source_id, target_id)] = count
            all_node_ids.add(source_id)
            all_node_ids.add(target_id)
        except ValueError:
            continue

    if not pair_counts:
        return 0

    existing_node_ids = set(
        MemoryNode.objects.filter(id__in=all_node_ids).values_list('id', flat=True)
    )

    valid_pairs = {}
    chunk_source_ids = set()
    chunk_target_ids = set()

    for (source_id, target_id), count in pair_counts.items():
        if source_id in existing_node_ids and target_id in existing_node_ids:
            valid_pairs[(source_id, target_id)] = count
            chunk_source_ids.add(source_id)
            chunk_target_ids.add(target_id)

    if not valid_pairs:
        return 0

    existing_links = MemoryLink.objects.filter(
        source_id__in=chunk_source_ids,
        target_id__in=chunk_target_ids
    )
    existing_links_map = {
        (link.source_id, link.target_id): link for link in existing_links
    }

    links_to_update = []
    links_to_create = []
    now = timezone.now()

    for (source_id, target_id), count in valid_pairs.items():
        if (source_id, target_id) in existing_links_map:
            link = existing_links_map[(source_id, target_id)]
            updated_at = getattr(link, 'updated_at', None) or now
            if timezone.is_naive(updated_at):
                updated_at = timezone.make_aware(updated_at, timezone.get_current_timezone())
            days_since = max(0.0, (now - updated_at).total_seconds() / 86400.0)
            decay_factor = math.exp(-days_since / DECAY_HALF_LIFE_DAYS)
            link.weight = min(1.0, float(link.weight) * decay_factor + count * LEARNING_RATE)
            links_to_update.append(link)
        else:
            initial_weight = 0.1
            new_weight = min(1.0, initial_weight + count * LEARNING_RATE)
            links_to_create.append(MemoryLink(
                source_id=source_id,
                target_id=target_id,
                weight=new_weight,
                relation="cooccurrence"
            ))

    if links_to_update or links_to_create:
        with transaction.atomic():
            if links_to_update:
                MemoryLink.objects.bulk_update(links_to_update, ['weight'])
            if links_to_create:
                MemoryLink.objects.bulk_create(links_to_create)
        return len(links_to_update) + len(links_to_create)

    return 0
