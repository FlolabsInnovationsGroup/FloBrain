import logging
import uuid
from typing import Dict, Any
from celery import shared_task
from django.db import transaction
from django_redis import get_redis_connection
from .models import MemoryNode, MemoryLink

logger = logging.getLogger(__name__)

@shared_task(name="flobrain.memory.task_apply_hebbian_learning")
def task_apply_hebbian_learning() -> str:
    try:
        redis_conn = get_redis_connection("default")
        buffer_key = "cooccurrence_buffer"
        
        if not redis_conn.exists(buffer_key):
            logger.debug("[Hebbian Learning] Redis buffer is empty.")
            return "Buffer empty"
            
        processing_key = f"{buffer_key}:processing:{uuid.uuid4().hex}"
        try:
            redis_conn.rename(buffer_key, processing_key)
        except Exception as rename_err:
            logger.warning(f"[Hebbian Learning] Buffer already claimed: {rename_err}")
            return "Buffer empty or already processing"

        learning_rate = 0.05
        total_updated_links = 0
        chunk_size = 1000
        current_chunk = {}

        for pair_bytes, count_bytes in redis_conn.hscan_iter(processing_key, count=chunk_size):
            current_chunk[pair_bytes] = count_bytes
            
            if len(current_chunk) >= chunk_size:
                total_updated_links += _process_memory_links_chunk(current_chunk, learning_rate)
                current_chunk = {}

        if current_chunk:
            total_updated_links += _process_memory_links_chunk(current_chunk, learning_rate)

        redis_conn.delete(processing_key)

        logger.info(f"[Hebbian Learning] Synchronization complete. Links updated/created: {total_updated_links}")
        return f"Updated {total_updated_links} links"
        
    except Exception as e:
        logger.error(f"[Hebbian Learning] Critical error during graph plasticity processing: {e}", exc_info=True)
        return f"Error: {e}"


def _process_memory_links_chunk(chunk: dict, learning_rate: float) -> int:
    pair_counts = {}
    all_node_ids = set()

    for pair_bytes, count_bytes in chunk.items():
        pair_str = pair_bytes.decode('utf-8') if isinstance(pair_bytes, bytes) else pair_bytes
        count = int(count_bytes)
        try:
            source_id, target_id = pair_str.split(":", 1)
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

    for (source_id, target_id), count in valid_pairs.items():
        if (source_id, target_id) in existing_links_map:
            link = existing_links_map[(source_id, target_id)]
            link.weight = min(1.0, float(link.weight) + (count * learning_rate))
            links_to_update.append(link)
        else:
            initial_weight = 0.1
            new_weight = min(1.0, initial_weight + (count * learning_rate))
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