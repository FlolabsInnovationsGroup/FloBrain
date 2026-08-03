from django.test import TestCase, override_settings

from users.models import User

from usage.models import TokenUsageRecord, UserPlanQuota, UserUsageSummary
from usage.services.quota import QuotaEnforcer
from usage.services.recorder import TokenUsageData, UsageRecorder


class UsageRecorderTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username="Test User",
            email="test@example.com",
            password_hash="unused",
        )

    def test_record_creates_usage_record_and_summaries(self):
        usage = TokenUsageData(
            provider=TokenUsageRecord.PROVIDER_MULTIMODAL,
            model="gpt-3.5-turbo",
            request_type=TokenUsageRecord.REQUEST_CHAT,
            prompt_tokens=10,
            completion_tokens=20,
            total_tokens=30,
            metadata={"source": "estimated"},
        )

        record = UsageRecorder().record(self.user, usage)

        self.assertEqual(record.total_tokens, 30)
        self.assertEqual(TokenUsageRecord.objects.filter(user=self.user).count(), 1)

        daily = UserUsageSummary.objects.get(
            user=self.user, period_type=UserUsageSummary.PERIOD_DAILY
        )
        self.assertEqual(daily.total_tokens, 30)
        self.assertEqual(daily.request_count, 1)

        monthly = UserUsageSummary.objects.get(
            user=self.user, period_type=UserUsageSummary.PERIOD_MONTHLY
        )
        self.assertEqual(monthly.total_tokens, 30)

        quota = UserPlanQuota.objects.get(user=self.user)
        self.assertEqual(quota.tokens_used_this_period, 30)
        self.assertEqual(quota.requests_used_this_period, 1)


class QuotaEnforcerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username="Quota User",
            email="quota@example.com",
            password_hash="unused",
        )

    def test_allows_under_limit(self):
        result = QuotaEnforcer().check(self.user)
        self.assertTrue(result.allowed)
        self.assertEqual(result.plan, "personal")
        self.assertEqual(result.limit_tokens, 100_000)
        self.assertEqual(result.limit_requests, 100)

    @override_settings(USAGE_TRACKING_ENABLED=True)
    def test_blocks_at_request_limit(self):
        quota = QuotaEnforcer().get_or_create_quota(self.user)
        quota.requests_used_this_period = 100
        quota.save()

        result = QuotaEnforcer().check(self.user)
        self.assertFalse(result.allowed)
        self.assertEqual(result.reason, "monthly_request_limit_exceeded")

    @override_settings(USAGE_TRACKING_ENABLED=False)
    def test_does_not_enforce_when_tracking_disabled(self):
        quota = QuotaEnforcer().get_or_create_quota(self.user)
        quota.requests_used_this_period = 100
        quota.save()

        result = QuotaEnforcer().check(self.user)
        self.assertTrue(result.allowed)
