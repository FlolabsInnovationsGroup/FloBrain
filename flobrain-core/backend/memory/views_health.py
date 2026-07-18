"""memory/views_health.py — Health Buddy MVP API (P3.06).

POST /api/health/measurements/ — accepts health measurements from wearables.
Creates a MemoryNode with memory_type=interaction, metadata.event_type=measurement_type.

Body:
    {
        "type": "heart_rate" | "steps" | "sleep" | "weight" | "blood_pressure",
        "value": 72,
        "unit": "bpm",
        "timestamp": "2026-07-15T10:30:00Z",
        "metadata": {}  // optional
    }

Response 201:
    {"id": "health_...", "status": "stored", "type": "heart_rate", "value": 72}
"""
import uuid
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import MemoryNode

logger = logging.getLogger(__name__)


def _get_user_or_401(request):
    try:
        from users.views import get_user_from_request
    except ImportError:
        return None, Response(
            {"error": "Auth module unavailable"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    user = get_user_from_request(request)
    if not user:
        return None, Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return user, None


VALID_MEASUREMENT_TYPES = {
    "heart_rate", "steps", "sleep", "weight", "blood_pressure",
    "oxygen_saturation", "body_temperature", "respiratory_rate",
    "blood_glucose", "calories", "distance", "active_minutes",
}


class HealthMeasurementView(APIView):
    """POST /api/health/measurements — store a health measurement."""

    def post(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err

        measurement_type = request.data.get("type", "").strip().lower()
        if not measurement_type:
            return Response(
                {"error": "Field 'type' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if measurement_type not in VALID_MEASUREMENT_TYPES:
            return Response(
                {"error": f"Invalid type. Must be one of: {sorted(VALID_MEASUREMENT_TYPES)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        value = request.data.get("value")
        if value is None:
            return Response(
                {"error": "Field 'value' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        unit = request.data.get("unit", "")
        timestamp = request.data.get("timestamp")
        extra_metadata = request.data.get("metadata", {})

        import time
        node_id = f"health_{measurement_type}_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"

        try:
            node = MemoryNode.objects.create(
                id=node_id,
                owner_id=str(user.id),
                name=f"{measurement_type}: {value} {unit}".strip(),
                tier_level=2,
                memory_type="interaction",
                relevance=0.5,
                metadata={
                    "type": "health_measurement",
                    "event_type": measurement_type,
                    "measurement_type": measurement_type,
                    "value": value,
                    "unit": unit,
                    "timestamp": timestamp,
                    **extra_metadata,
                },
            )

            # Publish event to Redis Streams (P3.05 integration)
            try:
                from .events.producer import publish_event
                publish_event(
                    "health_measurement",
                    {
                        "node_id": node.id,
                        "type": measurement_type,
                        "value": value,
                        "unit": unit,
                        "timestamp": timestamp,
                    },
                    user_id=str(user.id),
                )
            except Exception as e:
                logger.warning(f"[HealthView] event publish failed: {e}")

            return Response({
                "id": node.id,
                "status": "stored",
                "type": measurement_type,
                "value": value,
                "unit": unit,
                "timestamp": timestamp,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("[HealthMeasurementView] failed")
            return Response(
                {"error": "Internal error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """GET /api/health/measurements — list user's measurements."""
        user, err = _get_user_or_401(request)
        if err:
            return err
        measurement_type = request.query_params.get("type")
        limit = min(int(request.query_params.get("limit", 100)), 500)

        qs = MemoryNode.objects.filter(
            owner_id=str(user.id),
            metadata__type="health_measurement"
        ).order_by("-created_at")[:limit]

        if measurement_type:
            qs = qs.filter(metadata__measurement_type=measurement_type)

        results = []
        for node in qs:
            meta = node.metadata if isinstance(node.metadata, dict) else {}
            results.append({
                "id": node.id,
                "type": meta.get("measurement_type"),
                "value": meta.get("value"),
                "unit": meta.get("unit"),
                "timestamp": meta.get("timestamp"),
                "created_at": node.created_at.isoformat(),
            })

        return Response({"measurements": results, "count": len(results)})
