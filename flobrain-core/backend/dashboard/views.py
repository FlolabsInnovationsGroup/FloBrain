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


class DashboardHealthView(APIView):
    """
    GET /api/dashboard/health/
    No auth required. Returns backend status and optional DB check for "all systems operational".
    """

    def get(self, request):
        db_ok = True
        try:
            connection.ensure_connection()
        except Exception:
            db_ok = False

        return Response({
            "status": "ok" if db_ok else "degraded",
            "backend": "online",
            "database": "connected" if db_ok else "disconnected",
            "allSystemsOperational": db_ok,
        })


class DashboardMemoryActivityView(APIView):
    """
    GET /api/dashboard/memory-activity/
    Requires Bearer token. Returns counts for today, this week, total, and heatmap data.
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

        qs = MemoryNode.objects.all()

        today_count = qs.filter(created_at__gte=today_start).count()
        week_count = qs.filter(created_at__gte=week_start).count()
        total_count = qs.count()

        # Previous week for percentage change
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

        # Heatmap: activity by day of week (0=Monday) and hour (0-23)
        # Last 7 days of data, aggregate by weekday + hour
        from django.db.models.functions import ExtractHour, ExtractWeekDay

        heatmap_qs = (
            qs.filter(created_at__gte=week_start)
            .annotate(weekday=ExtractWeekDay("created_at"), hour=ExtractHour("created_at"))
            .values("weekday", "hour")
            .annotate(count=Count("id"))
        )
        # Build 7 x 24 grid; Django ExtractWeekDay: 1=Sunday, 2=Monday, ... 7=Saturday
        # Frontend expects days Mon-Sun (index 0-6). Map: frontend 0=Mon -> Django 2, 1=Tue -> 3, ...
        max_count = 1
        heatmap = [[0] * 24 for _ in range(7)]
        for row in heatmap_qs:
            # Convert to frontend day index: Django 1=Sun->6, 2=Mon->0, 3=Tue->1, ... 7=Sat->5
            d = row["weekday"]
            day_index = (d - 2) % 7 if d else 0
            hour = min(23, max(0, row["hour"]))
            c = row["count"]
            heatmap[day_index][hour] = c
            if c > max_count:
                max_count = c

        # Normalize to 0-1 for frontend color scale
        if max_count < 1:
            max_count = 1
        heatmap_normalized = []
        for day_row in heatmap:
            heatmap_normalized.append([v / max_count for v in day_row])

        return Response({
            "today_count": today_count,
            "week_count": week_count,
            "total_count": total_count,
            "week_percentage": week_percentage,
            "week_positive": week_positive,
            "heatmap": heatmap_normalized,
        })
