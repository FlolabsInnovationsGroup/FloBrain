from datetime import timedelta
from typing import Any

from django.db.models import Sum
from django.utils import timezone

from usage.models import TokenUsageRecord, UserUsageSummary


class UsageAggregator:
    def get_daily_usage(self, user, days: int = 7) -> list[dict[str, Any]]:
        today = timezone.now().date()
        start = today - timedelta(days=days - 1)
        summaries = (
            UserUsageSummary.objects.filter(
                user=user,
                period_type=UserUsageSummary.PERIOD_DAILY,
                period_start__gte=start,
                period_start__lte=today,
            )
            .order_by("period_start")
        )
        by_date = {s.period_start: s for s in summaries}

        result = []
        for i in range(days):
            day = start + timedelta(days=i)
            summary = by_date.get(day)
            result.append(
                {
                    "date": day.isoformat(),
                    "total_tokens": summary.total_tokens if summary else 0,
                    "request_count": summary.request_count if summary else 0,
                }
            )
        return result

    def get_period_summary(self, user, days: int = 7) -> dict[str, Any]:
        today = timezone.now().date()
        current_start = today - timedelta(days=days - 1)
        previous_start = current_start - timedelta(days=days)
        previous_end = current_start - timedelta(days=1)

        current_total = self._sum_tokens(user, current_start, today)
        previous_total = self._sum_tokens(user, previous_start, previous_end)

        change_pct = 0.0
        if previous_total > 0:
            change_pct = ((current_total - previous_total) / previous_total) * 100
        elif current_total > 0:
            change_pct = 100.0

        breakdown = (
            TokenUsageRecord.objects.filter(
                user=user,
                created_at__date__gte=current_start,
                created_at__date__lte=today,
            )
            .values("model")
            .annotate(total=Sum("total_tokens"))
            .order_by("-total")
        )

        return {
            "total_tokens": current_total,
            "change_percent": round(change_pct, 1),
            "period_start": current_start.isoformat(),
            "period_end": today.isoformat(),
            "breakdown_by_model": list(breakdown),
        }

    def _sum_tokens(self, user, start, end) -> int:
        agg = TokenUsageRecord.objects.filter(
            user=user,
            created_at__date__gte=start,
            created_at__date__lte=end,
        ).aggregate(total=Sum("total_tokens"))
        return int(agg["total"] or 0)
