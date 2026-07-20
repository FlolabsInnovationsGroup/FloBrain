import calendar
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any, Optional

from django.db import transaction
from django.utils import timezone

from usage.models import TokenUsageRecord, UserUsageSummary
from usage.pricing import compute_cost_usd


@dataclass
class TokenUsageData:
    provider: str
    model: str
    request_type: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    chat_id: Optional[int] = None
    message_id: Optional[int] = None
    estimated_cost_usd: Optional[float] = None
    metadata: dict[str, Any] = field(default_factory=dict)


class UsageRecorder:
    def record(self, user, usage: TokenUsageData) -> TokenUsageRecord:
        today = timezone.now().date()
        month_start = today.replace(day=1)
        last_day = calendar.monthrange(today.year, today.month)[1]
        month_end = today.replace(day=last_day)

        cost = usage.estimated_cost_usd
        if cost is None:
            cost = compute_cost_usd(usage.model, usage.prompt_tokens, usage.completion_tokens)

        with transaction.atomic():
            record = TokenUsageRecord.objects.create(
                user=user,
                chat_id=usage.chat_id,
                message_id=usage.message_id,
                provider=usage.provider,
                model=usage.model,
                request_type=usage.request_type,
                prompt_tokens=usage.prompt_tokens,
                completion_tokens=usage.completion_tokens,
                total_tokens=usage.total_tokens,
                estimated_cost_usd=cost,
                metadata=usage.metadata,
            )

            self._increment_summary(
                user,
                today,
                today,
                UserUsageSummary.PERIOD_DAILY,
                usage,
            )
            self._increment_summary(
                user,
                month_start,
                month_end,
                UserUsageSummary.PERIOD_MONTHLY,
                usage,
            )

            from usage.services.quota import QuotaEnforcer

            QuotaEnforcer().increment_usage(user, usage.total_tokens)

        return record

    def _increment_summary(
        self,
        user,
        period_start,
        period_end,
        period_type: str,
        usage: TokenUsageData,
    ) -> None:
        summary, _ = UserUsageSummary.objects.select_for_update().get_or_create(
            user=user,
            period_start=period_start,
            period_type=period_type,
            defaults={
                "period_end": period_end,
                "total_tokens": 0,
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "request_count": 0,
            },
        )
        summary.total_tokens += usage.total_tokens
        summary.prompt_tokens += usage.prompt_tokens
        summary.completion_tokens += usage.completion_tokens
        summary.request_count += 1
        summary.save(
            update_fields=[
                "total_tokens",
                "prompt_tokens",
                "completion_tokens",
                "request_count",
                "updated_at",
            ]
        )
