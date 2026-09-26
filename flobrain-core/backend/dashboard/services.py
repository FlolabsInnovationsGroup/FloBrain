"""
Dashboard services: live health checks and error-log aggregation.
All queries are scoped to the authenticated user — no cross-user data leakage.
"""

import logging
from datetime import timedelta

from django.utils import timezone

logger = logging.getLogger(__name__)


def check_postgres(connection) -> bool:
    """Return True if the default PostgreSQL connection is reachable."""
    try:
        connection.ensure_connection()
        return True
    except Exception:
        return False


def check_mongodb() -> bool:
    """Return True if the MongoDB server is reachable."""
    try:
        from memory.mongo_client import client as mongo_client
        mongo_client.admin.command("ping")
        return True
    except Exception:
        return False


def get_connected_devices_count() -> int:
    """
    Count distinct active devices by a stable device_info identifier.

    A single physical device can hold multiple rotated refresh tokens, so we
    count distinct non-null device_info values rather than token rows to avoid
    inflation.  Guest sessions tracked in GuestDeviceMap are counted separately
    and added to the total.
    """
    try:
        from users.models import GuestDeviceMap, RefreshToken

        now = timezone.now()
        # Distinct device_info values from non-revoked, non-expired auth tokens
        auth_devices = (
            RefreshToken.objects.filter(revoked=False, expires_at__gt=now)
            .exclude(device_info__isnull=True)
            .exclude(device_info="")
            .values("device_info")
            .distinct()
            .count()
        )
        # Guest devices tracked separately
        guest_devices = GuestDeviceMap.objects.filter(expires_at__gt=now).count()
        return auth_devices + guest_devices
    except Exception:
        logger.exception("Failed to count connected devices")
        return 0


def derive_system_status(db_ok: bool, mongo_ok: bool) -> str:
    """
    Map service health to a system status string.
    Possible values: "online" | "loading" | "degraded" | "offline" | "critical_error"
    """
    if not db_ok and not mongo_ok:
        return "offline"
    if not db_ok or not mongo_ok:
        return "degraded"
    if _is_system_loading():
        return "loading"
    return "online"


def _is_system_loading() -> bool:
    """
    Return True when there are workflow steps with an explicitly pending/running
    status created in the last 3 minutes.  Completed or failed steps are NOT
    classified as loading.
    """
    now = timezone.now()
    loading_window = now - timedelta(minutes=3)
    try:
        from memory.mongo_client import db as mongo_db
        return (
            mongo_db.workflow_steps.count_documents(
                {
                    "created_at": {"$gte": loading_window},
                    "status": {"$in": ["pending", "running", "in_progress"]},
                }
            )
            > 0
        )
    except Exception:
        return False


def get_error_logs(user_id, limit: int = 20) -> list:
    """
    Return recent warning/error workflow-step events scoped to the authenticated user.

    Strategy: fetch the user's workflow IDs first, then query workflow_steps for
    those IDs only — avoids the N+1 per-step owner lookup and prevents leaking
    other users' error data.

    Steps whose workflow no longer exists (orphaned) are excluded because we
    cannot verify ownership.
    """
    try:
        from bson import ObjectId
        from memory.mongo_client import db as mongo_db

        str_user_id = str(user_id)

        # Gather all workflow IDs that belong to this user
        user_workflows = mongo_db.workflows.find(
            {"user_id": str_user_id},
            {"_id": 1},
        )
        workflow_ids = [doc["_id"] for doc in user_workflows]

        if not workflow_ids:
            return []

        failed_steps = (
            mongo_db.workflow_steps.find(
                {
                    "workflow_id": {"$in": [str(wid) for wid in workflow_ids]},
                    "status": {"$in": ["error", "failed", "failure", "warning"]},
                }
            )
            .sort("created_at", -1)
            .limit(limit)
        )

        logs = []
        for step in failed_steps:
            created = step.get("created_at")
            timestamp = (
                created.strftime("%d/%m/%y") if hasattr(created, "strftime") else str(created or "")
            )
            logs.append(
                {
                    "level": "error" if step.get("status") in ("error", "failed", "failure") else "warning",
                    "message": step.get("error") or step.get("step_type") or "Workflow step failed",
                    "timestamp": timestamp,
                }
            )
        return logs
    except Exception:
        logger.exception("Failed to fetch error logs for user %s", user_id)
        return []
