"""memory/events/consumer.py — Redis Streams consumer as Celery task (P3.05).

Reads events from Redis Stream events:memory via XREADGROUP, dispatches to
appropriate handlers based on event_type. Runs as Celery worker — automatically
distributed across multiple worker processes.

Event handlers:
  - voice_transcript    → supermemory_adapter.memorize()
  - chat_message        → supermemory_adapter.memorize() with metadata.event_type
  - document_uploaded   → supermemory_connector.upload_file()
  - health_measurement  → views_health.HealthMeasurementView logic
"""
import json
import logging
from typing import Dict, Any

from celery import shared_task
from django_redis import get_redis_connection

from .producer import STREAM_NAME, create_consumer_group

logger = logging.getLogger(__name__)

CONSUMER_GROUP = "memory-workers"
CONSUMER_NAME = "worker-{hostname}"  # filled at runtime
BLOCK_MS = 5000  # 5s blocking read
BATCH_SIZE = 10


@shared_task(name="flobrain.memory.events.consume_memory_events")
def consume_memory_events(max_iterations: int = 100):
    """Celery task: reads events from Redis Stream and dispatches to handlers.

    Args:
        max_iterations: safety limit to prevent infinite loop in tests
    """
    import socket
    consumer_name = CONSUMER_NAME.format(hostname=socket.gethostname())

    create_consumer_group(CONSUMER_GROUP)

    redis_conn = get_redis_connection("default")
    processed = 0
    errors = 0

    for _ in range(max_iterations):
        try:
            # Read entries: > = unseen by this consumer group
            response = redis_conn.xreadgroup(
                CONSUMER_GROUP, consumer_name,
                {STREAM_NAME: ">"},
                count=BATCH_SIZE,
                block=BLOCK_MS,
            )

            if not response:
                # No new events — exit gracefully
                break

            for stream, messages in response:
                for msg_id, fields in messages:
                    try:
                        _process_message(fields)
                        redis_conn.xack(STREAM_NAME, CONSUMER_GROUP, msg_id)
                        processed += 1
                    except Exception as e:
                        logger.error(f"[events:consumer] Failed msg {msg_id}: {e}")
                        errors += 1

        except Exception as e:
            logger.error(f"[events:consumer] XREADGROUP failed: {e}")
            break

    logger.info(f"[events:consumer] Processed={processed} Errors={errors}")
    return {"processed": processed, "errors": errors}


def _process_message(fields: Dict[bytes, bytes]):
    """Dispatches event to appropriate handler based on event_type."""
    # Decode bytes keys/values
    decoded = {}
    for k, v in fields.items():
        key = k.decode() if isinstance(k, bytes) else k
        val = v.decode() if isinstance(v, bytes) else v
        decoded[key] = val

    event_type = decoded.get("event_type", "unknown")
    payload_str = decoded.get("payload", "{}")
    user_id = decoded.get("user_id")

    try:
        payload = json.loads(payload_str)
    except json.JSONDecodeError:
        logger.warning(f"[events:consumer] Invalid JSON payload: {payload_str[:100]}")
        return

    logger.info(f"[events:consumer] Processing {event_type} for user={user_id}")

    if event_type in ("voice_transcript", "chat_message"):
        _handle_memorize_event(event_type, payload, user_id)
    elif event_type == "health_measurement":
        _handle_health_event(payload, user_id)
    elif event_type == "document_uploaded":
        _handle_upload_event(payload, user_id)
    else:
        logger.warning(f"[events:consumer] Unknown event_type: {event_type}")


def _handle_memorize_event(event_type: str, payload: Dict[str, Any], user_id: str):
    """Calls supermemory_adapter.memorize() for transcript/chat events."""
    from ..supermemory_adapter import supermemory_adapter
    content = payload.get("content") or payload.get("text") or ""
    if not content:
        return
    supermemory_adapter.memorize(
        content=content,
        owner_id=user_id or "system",
        metadata={
            "source": event_type,
            "event_type": event_type,
            **payload.get("metadata", {}),
        },
        importance=float(payload.get("importance", 0.5)),
    )


def _handle_health_event(payload: Dict[str, Any], user_id: str):
    """Stores health measurement as MemoryNode with metadata.event_type."""
    from ..models import MemoryNode
    measurement_type = payload.get("type", "unknown")
    value = payload.get("value")
    unit = payload.get("unit", "")
    timestamp = payload.get("timestamp")

    MemoryNode.objects.create(
        id=f"health_{measurement_type}_{int(__import__('time').time() * 1000)}",
        owner_id=user_id or "system",
        name=f"{measurement_type}: {value} {unit}",
        tier_level=2,
        memory_type="interaction",
        metadata={
            "type": "health_measurement",
            "measurement_type": measurement_type,
            "value": value,
            "unit": unit,
            "timestamp": timestamp,
        },
    )
    logger.info(f"[events:consumer] Health event stored: {measurement_type}={value}{unit}")


def _handle_upload_event(payload: Dict[str, Any], user_id: str):
    """Calls supermemory_connector.upload_file() for file upload events."""
    from .. import supermemory_connector as smc
    file_path = payload.get("file_path")
    if not file_path:
        return
    smc.upload_file(file_path=file_path, metadata={"owner_id": user_id, **payload.get("metadata", {})})
