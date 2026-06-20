from datetime import timedelta

from django.utils import timezone
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from brain.models import Chat, Message
from users.jwt_utils import make_access_token
from users.models import User
from usage.models import TokenUsageRecord, UserPlanQuota


class SendMessageUsageTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username="Brain User",
            email="brain@example.com",
            password_hash="unused",
        )
        self.token = make_access_token(str(self.user.id))
        self.chat = Chat.objects.create(user=self.user, title="Test Chat")

    @override_settings(LLM_PROVIDER="mock", USAGE_TRACKING_ENABLED=True)
    def test_send_message_records_token_usage(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            f"/api/brain/chats/{self.chat.id}/send/",
            {"text": "Hello FloBrain"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("usage", data)
        self.assertGreater(data["usage"]["total_tokens"], 0)

        self.assertEqual(TokenUsageRecord.objects.filter(user=self.user).count(), 1)
        assistant = Message.objects.filter(chat=self.chat, role=Message.ROLE_ASSISTANT).first()
        self.assertIsNotNone(assistant.prompt_tokens)
        self.assertIsNotNone(assistant.completion_tokens)

    @override_settings(LLM_PROVIDER="mock", USAGE_TRACKING_ENABLED=True)
    def test_send_message_returns_429_when_quota_exceeded(self):
        quota = UserPlanQuota.objects.create(
            user=self.user,
            plan_id="personal",
            monthly_token_limit=100_000,
            monthly_request_limit=1,
            tokens_used_this_period=0,
            requests_used_this_period=1,
            period_reset_at=timezone.now() + timedelta(days=30),
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            f"/api/brain/chats/{self.chat.id}/send/",
            {"text": "Over quota"},
            format="json",
        )
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json()["error"], "Quota exceeded")
