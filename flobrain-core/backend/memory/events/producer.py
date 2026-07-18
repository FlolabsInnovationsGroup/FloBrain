"""memory/events/producer.py — Redis Streams event producer (P3.05).

Publishes memory events to Redis Streams. Consumers (Celery workers) read
via XREADGROUP and process asynchronously — e.g. trigger memorize() for
incoming voice/text events.

Stream: events:memory
Event types:
  - voice_transcript    — voice-to-text output
  - chat_message        — user chat message
  - document_uploaded   — file ingested
  - health_measurement  — wearable data point

Usage:
    from memory.events.producer import publish_event
    publish_event("voice_transcript", {"content": "...", "user_id": "..."})
"""
import json
import logging
import time
from typing import Dict, Any, Optional

from django_redis import get_redis_connection

logger = logging.getLogger(__name__)

STREAM_NAME = "events:memory"
MAX_STREAM_LENGTH = 100_000  # cap to prevent unbounded growth


def publish_event(event_type: str, payload: Dict[str, Any],
                  user_id: Optional[str] = None) -> str:
    """Publishes an event to Redis Streams.

    Args:
        event_type: one of voice_transcript, chat_message, document_uploaded, health_measurement
        payload: event data dict (must be JSON-serializable)
        user_id: optional user ID for routing

    Returns:
        Stream entry ID (e.g. "1234567890-0")
    """
    try:
        redis_conn = get_redis_connection("default")
        fields = {
            "event_type": event_type,
            "payload": json.dumps(payload, default=str),
            "timestamp": str(time.time()),
        }
        if user_id:
            fields["user_id"] = user_id

        # XADD with maxlen trim (approximate for performance)
        entry_id = redis_conn.xadd(STREAM_NAME, fields, maxlen=MAX_STREAM_LENGTH, approximate=True)
        logger.info(f"[events:producer] Published {event_type} → {entry_id}")
        return entry_id.decode() if isinstance(entry_id, bytes) else entry_id
    except Exception as e:
        logger.error(f"[events:producer] Failed to publish {event_type}: {e}")
        raise


def get_stream_length() -> int:
    """Returns current stream length (for monitoring)."""
    try:
        redis_conn = get_redis_connection("default")
        return redis_conn.xlen(STREAM_NAME)
    except Exception:
        return 0


def create_consumer_group(group_name: str = "memory-workers") -> bool:
    """Creates consumer group for parallel processing. Idempotent."""
    try:
        redis_conn = get_redis_connection("default")
        redis_conn.xgroup_create(STREAM_NAME, group_name, id="0", mkstream=True)
        logger.info(f"[events:producer] Consumer group '{group_name}' created")
        return True
    except Exception as e:
        if "BUSYGROUP" in str(e):
            return True  # already exists — fine
        logger.warning(f"[events:producer] Failed to create consumer group: {e}")
        return False
