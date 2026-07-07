"""
Helpers for dashboard health and error-log endpoints.
"""

from datetime import timedelta

from bson import ObjectId
from django.utils import timezone

from memory.mongo_client import db as mongo_db
from users.models import GuestDeviceMap, RefreshToken


def check_postgres(connection):
    """Return True when the default database connection is reachable."""
    try:
        connection.ensure_connection()
        return True
    except Exception:
        return False


def check_mongodb():
    """Return True when MongoDB responds to a ping."""
    try:
        mongo_db.client.admin.command("ping")
        return True
    except Exception:
        return False


def get_connected_devices_count():
    """
    Count active guest devices and authenticated sessions with device metadata.
    """
    now = timezone.now()
    guest_devices = GuestDeviceMap.objects.filter(expires_at__gt=now).count()
    auth_devices = (
        RefreshToken.objects.filter(revoked=False, expires_at__gt=now)
        .exclude(device_info__isnull=True)
        .exclude(device_info="")
        .count()
    )
    return guest_devices + auth_devices


def _is_system_loading():
    """
    Return True when core services are up but the system is actively processing.
    """
    now = timezone.now()
    loading_window = now - timedelta(minutes=3)

    from memory.models import MemoryNode

    if MemoryNode.objects.filter(updated_at__gte=loading_window).exists():
        return True

    try:
        return mongo_db.workflow_steps.count_documents(
            {
                "created_at": {"$gte": loading_window},
                "step_type": {"$in": ["validate_input", "llm_call"]},
            }
        ) > 0
    except Exception:
        return False


def derive_system_status(db_ok, mongo_ok, connected_devices):
    """
    Map infrastructure checks to a frontend system_status value.

    Possible values: online | idle | loading | offline | critical_error
    """
    if not db_ok:
        return "critical_error"
    if not mongo_ok:
        return "offline"
    if _is_system_loading():
        return "loading"

    from memory.models import MemoryNode

    recent_activity = MemoryNode.objects.filter(
        updated_at__gte=timezone.now() - timedelta(hours=1)
    ).exists()

    if connected_devices == 0 and not recent_activity:
        return "idle"
    return "online"


def _event_level(status):
    status = (status or "").lower()
    if status in {"error", "failed", "failure"}:
        return "error"
    if status in {"warning", "warn"}:
        return "warning"
    return "warning"


def _event_message(event):
    payload = event.get("payload") or {}
    if isinstance(payload, dict):
        for key in ("message", "error", "detail", "details"):
            value = payload.get(key)
            if value:
                return str(value)
    event_type = event.get("event_type") or "system_event"
    return event_type.replace("_", " ").capitalize()


def _event_timestamp(event):
    created_at = event.get("created_at")
    if created_at is None:
        return timezone.now().strftime("%m/%d/%y")
    if timezone.is_naive(created_at):
        created_at = timezone.make_aware(created_at, timezone.utc)
    return timezone.localtime(created_at).strftime("%m/%d/%y")


def _workflow_owner_id(workflow_id):
    if not workflow_id:
        return None
    try:
        workflow = mongo_db.workflows.find_one({"_id": ObjectId(workflow_id)})
    except Exception:
        workflow = mongo_db.workflows.find_one({"_id": workflow_id})
    return workflow.get("user_id") if workflow else None


def get_error_logs(user_id, limit=50):
    """
    Return recent warning/error events from MongoDB workflow collections.
    """
    user_ids = [str(user_id), user_id, None]
    event_query = {
        "$or": [
            {"status": {"$in": ["error", "warning", "failed", "failure", "warn"]}},
            {"event_type": {"$regex": "error", "$options": "i"}},
        ],
        "user_id": {"$in": user_ids},
    }

    logs = []
    seen = set()

    def _append(level, message, timestamp, key):
        if key in seen:
            return
        seen.add(key)
        logs.append({"level": level, "message": message, "timestamp": timestamp})

    try:
        events = (
            mongo_db.workflow_events.find(event_query)
            .sort("created_at", -1)
            .limit(limit)
        )
        for event in events:
            _append(
                _event_level(event.get("status")),
                _event_message(event),
                _event_timestamp(event),
                f"event:{event.get('_id')}",
            )

        failed_steps = (
            mongo_db.workflow_steps.find(
                {"status": {"$in": ["error", "failed", "failure", "warning"]}}
            )
            .sort("created_at", -1)
            .limit(limit)
        )
        for step in failed_steps:
            owner_id = _workflow_owner_id(step.get("workflow_id"))
            if owner_id not in user_ids and owner_id is not None:
                continue

            output = step.get("output") or {}
            message = output.get("error") or output.get("message")
            if not message:
                message = f"{step.get('step_type', 'workflow')} step {step.get('status', 'failed')}"

            _append(
                _event_level(step.get("status")),
                str(message),
                _event_timestamp(step),
                f"step:{step.get('_id')}",
            )

        return logs[:limit]
    except Exception:
        return []
