"""
Dashboard API: system health (unauthenticated) and memory activity stats (authenticated).
"""

from datetime import timedelta

from django.db import connection
from django.db.models import Count
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from memory.models import MemoryNode
from users.views import get_user_from_request

from .services import (
    check_mongodb,
    check_postgres,
    derive_system_status,
    get_connected_devices_count,
    get_error_logs,
)


class DashboardHealthView(APIView):
    """
    GET /api/dashboard/health/
    No auth required. Returns live PostgreSQL + MongoDB status and connected-device count.
    Dependent queries (device count) are skipped when Postgres is unavailable to prevent
    a 500 during a DB outage — the endpoint always returns a structured response.
    """

    def get(self, request):
        db_ok = check_postgres(connection)
        mongo_ok = check_mongodb()

        connected_devices = 0
        if db_ok:
            connected_devices = get_connected_devices_count()

        system_status = derive_system_status(db_ok, mongo_ok)

        if db_ok and mongo_ok:
            overall_status = "ok"
        elif not db_ok and not mongo_ok:
            overall_status = "offline"
        else:
            overall_status = "degraded"

        return Response({
            "status": overall_status,
            "backend": "online",
            "database": "connected" if db_ok else "disconnected",
            "mongodb": "connected" if mongo_ok else "disconnected",
            "allSystemsOperational": db_ok and mongo_ok,
            "system_status": system_status,
            "connected_devices": connected_devices,
        })


class DashboardMemoryActivityView(APIView):
    """
    GET /api/dashboard/memory-activity/
    Requires Bearer token. Returns counts for today, this week, total, and heatmap data.
    All queries are scoped to the authenticated user's own memory nodes.
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required", "details": "Valid Bearer token required"},
                status=401,
            )

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)

        # Scope all queries to the authenticated user's own memory nodes
        qs = MemoryNode.objects.filter(owner_id=str(user.id))

        today_count = qs.filter(created_at__gte=today_start).count()
        week_count = qs.filter(created_at__gte=week_start).count()
        total_count = qs.count()

        prev_week_start = now - timedelta(days=14)
        prev_week_count = qs.filter(
            created_at__gte=prev_week_start,
            created_at__lt=week_start,
        ).count()
        if prev_week_count > 0:
            week_pct = round(((week_count - prev_week_count) / prev_week_count) * 100, 1)
            week_percentage = f"+{week_pct}%" if week_pct >= 0 else f"{week_pct}%"
            week_positive = week_pct >= 0
        else:
            week_percentage = "+0%"
            week_positive = True

        from django.db.models.functions import ExtractHour, ExtractWeekDay

        heatmap_qs = (
            qs.filter(created_at__gte=week_start)
            .annotate(weekday=ExtractWeekDay("created_at"), hour=ExtractHour("created_at"))
            .values("weekday", "hour")
            .annotate(count=Count("id"))
        )
        max_count = 1
        heatmap = [[0] * 24 for _ in range(7)]
        for row in heatmap_qs:
            d = row["weekday"]
            day_index = (d - 2) % 7 if d else 0
            hour = min(23, max(0, row["hour"]))
            c = row["count"]
            heatmap[day_index][hour] = c
            if c > max_count:
                max_count = c

        if max_count < 1:
            max_count = 1
        heatmap_normalized = [
            [v / max_count for v in day_row] for day_row in heatmap
        ]

        return Response({
            "today_count": today_count,
            "week_count": week_count,
            "total_count": total_count,
            "week_percentage": week_percentage,
            "week_positive": week_positive,
            "heatmap": heatmap_normalized,
        })


class DashboardErrorLogView(APIView):
    """
    GET /api/dashboard/error-logs/
    Requires Bearer token. Returns live error/warning events from MongoDB,
    scoped to the authenticated user's workflows.
    Response key: "error_logs" (snake_case, consistent with URL path).
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required", "details": "Valid Bearer token required"},
                status=401,
            )

        logs = get_error_logs(user.id)
        return Response({"error_logs": logs})
