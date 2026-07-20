from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from usage.models import UserPlanQuota
from usage.plan_config import DEFAULT_PLAN, PLAN_LIMITS


@dataclass
class QuotaCheckResult:
    allowed: bool
    plan: str
    remaining_tokens: Optional[int]
    remaining_requests: Optional[int]
    used_tokens: int
    used_requests: int
    limit_tokens: Optional[int]
    limit_requests: Optional[int]
    reset_at: datetime
    warning_percent: Optional[int] = None
    reason: Optional[str] = None


def _next_month(dt: datetime) -> datetime:
    if dt.month == 12:
        return dt.replace(year=dt.year + 1, month=1)
    return dt.replace(month=dt.month + 1)


class QuotaEnforcer:
    def get_or_create_quota(self, user) -> UserPlanQuota:
        try:
            return user.plan_quota
        except UserPlanQuota.DoesNotExist:
            plan_id = self._resolve_plan_id(user)
            limits = PLAN_LIMITS.get(plan_id, PLAN_LIMITS[DEFAULT_PLAN])
            now = timezone.now()
            return UserPlanQuota.objects.create(
                user=user,
                plan_id=plan_id,
                monthly_token_limit=limits["monthly_token_limit"],
                monthly_request_limit=limits["monthly_request_limit"],
                period_reset_at=_next_month(now),
            )

    def _resolve_plan_id(self, user) -> str:
        billing = user.billing.order_by("-renewal_date").first()
        if billing and billing.plan:
            plan_key = billing.plan.lower().strip()
            if plan_key in PLAN_LIMITS:
                return plan_key
        return DEFAULT_PLAN

    def _maybe_reset_period(self, quota: UserPlanQuota) -> None:
        now = timezone.now()
        if now >= quota.period_reset_at:
            quota.tokens_used_this_period = 0
            quota.requests_used_this_period = 0
            quota.period_reset_at = _next_month(now)
            quota.save(
                update_fields=[
                    "tokens_used_this_period",
                    "requests_used_this_period",
                    "period_reset_at",
                    "updated_at",
                ]
            )

    def check(self, user) -> QuotaCheckResult:
        with transaction.atomic():
            quota = (
                UserPlanQuota.objects.select_for_update()
                .filter(user=user)
                .first()
            )
            if quota is None:
                quota = self.get_or_create_quota(user)
                quota = UserPlanQuota.objects.select_for_update().get(pk=quota.pk)

            self._maybe_reset_period(quota)

            if quota.admin_override:
                return QuotaCheckResult(
                    allowed=True,
                    plan=quota.plan_id,
                    remaining_tokens=None,
                    remaining_requests=None,
                    used_tokens=quota.tokens_used_this_period,
                    used_requests=quota.requests_used_this_period,
                    limit_tokens=quota.monthly_token_limit,
                    limit_requests=quota.monthly_request_limit,
                    reset_at=quota.period_reset_at,
                )

            token_limit = quota.monthly_token_limit
            request_limit = quota.monthly_request_limit
            used_tokens = quota.tokens_used_this_period
            used_requests = quota.requests_used_this_period

            remaining_tokens = (
                None if token_limit is None else max(0, token_limit - used_tokens)
            )
            remaining_requests = (
                None
                if request_limit is None
                else max(0, request_limit - used_requests)
            )

            warning_percent = None
            soft_limit = getattr(settings, "USAGE_SOFT_LIMIT_PERCENT", 80)
            if token_limit:
                pct = (used_tokens / token_limit) * 100
                if pct >= soft_limit:
                    warning_percent = int(pct)

            enforce = getattr(settings, "USAGE_TRACKING_ENABLED", True)
            if not enforce:
                return QuotaCheckResult(
                    allowed=True,
                    plan=quota.plan_id,
                    remaining_tokens=remaining_tokens,
                    remaining_requests=remaining_requests,
                    used_tokens=used_tokens,
                    used_requests=used_requests,
                    limit_tokens=token_limit,
                    limit_requests=request_limit,
                    reset_at=quota.period_reset_at,
                    warning_percent=warning_percent,
                )

            if token_limit is not None and used_tokens >= token_limit:
                return QuotaCheckResult(
                    allowed=False,
                    plan=quota.plan_id,
                    remaining_tokens=0,
                    remaining_requests=remaining_requests,
                    used_tokens=used_tokens,
                    used_requests=used_requests,
                    limit_tokens=token_limit,
                    limit_requests=request_limit,
                    reset_at=quota.period_reset_at,
                    reason="monthly_token_limit_exceeded",
                )

            if request_limit is not None and used_requests >= request_limit:
                return QuotaCheckResult(
                    allowed=False,
                    plan=quota.plan_id,
                    remaining_tokens=remaining_tokens,
                    remaining_requests=0,
                    used_tokens=used_tokens,
                    used_requests=used_requests,
                    limit_tokens=token_limit,
                    limit_requests=request_limit,
                    reset_at=quota.period_reset_at,
                    reason="monthly_request_limit_exceeded",
                )

            return QuotaCheckResult(
                allowed=True,
                plan=quota.plan_id,
                remaining_tokens=remaining_tokens,
                remaining_requests=remaining_requests,
                used_tokens=used_tokens,
                used_requests=used_requests,
                limit_tokens=token_limit,
                limit_requests=request_limit,
                reset_at=quota.period_reset_at,
                warning_percent=warning_percent,
            )

    def increment_usage(self, user, tokens: int) -> None:
        with transaction.atomic():
            quota = (
                UserPlanQuota.objects.select_for_update()
                .filter(user=user)
                .first()
            )
            if quota is None:
                quota = self.get_or_create_quota(user)
                quota = UserPlanQuota.objects.select_for_update().get(pk=quota.pk)

            self._maybe_reset_period(quota)
            quota.tokens_used_this_period += tokens
            quota.requests_used_this_period += 1
            quota.save(
                update_fields=[
                    "tokens_used_this_period",
                    "requests_used_this_period",
                    "updated_at",
                ]
            )
