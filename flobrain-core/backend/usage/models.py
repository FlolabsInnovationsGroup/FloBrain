import uuid

from django.db import models
from django.utils import timezone


class TokenUsageRecord(models.Model):
    PROVIDER_OPENAI = "openai"
    PROVIDER_ANTHROPIC = "anthropic"
    PROVIDER_GOOGLE = "google"
    PROVIDER_MOCK = "mock"
    PROVIDER_CHOICES = [
        (PROVIDER_OPENAI, "OpenAI"),
        (PROVIDER_ANTHROPIC, "Anthropic"),
        (PROVIDER_GOOGLE, "Google"),
        (PROVIDER_MOCK, "Mock"),
    ]

    REQUEST_CHAT = "chat_completion"
    REQUEST_EMBEDDING = "embedding"
    REQUEST_VISION = "vision"
    REQUEST_TYPE_CHOICES = [
        (REQUEST_CHAT, "Chat completion"),
        (REQUEST_EMBEDDING, "Embedding"),
        (REQUEST_VISION, "Vision"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="token_usage_records",
        db_column="user_id",
        to_field="id",
    )
    chat = models.ForeignKey(
        "brain.Chat",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="token_usage_records",
        db_column="chat_id",
    )
    message = models.ForeignKey(
        "brain.Message",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="token_usage_records",
        db_column="message_id",
    )
    provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES)
    model = models.CharField(max_length=128)
    request_type = models.CharField(max_length=32, choices=REQUEST_TYPE_CHOICES)
    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    estimated_cost_usd = models.DecimalField(
        max_digits=10, decimal_places=6, null=True, blank=True
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "token_usage_records"
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "model"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user_id} {self.model} {self.total_tokens} tokens"


class UserUsageSummary(models.Model):
    PERIOD_DAILY = "daily"
    PERIOD_MONTHLY = "monthly"
    PERIOD_TYPE_CHOICES = [
        (PERIOD_DAILY, "Daily"),
        (PERIOD_MONTHLY, "Monthly"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="usage_summaries",
        db_column="user_id",
        to_field="id",
    )
    period_start = models.DateField()
    period_end = models.DateField()
    period_type = models.CharField(max_length=16, choices=PERIOD_TYPE_CHOICES)
    total_tokens = models.BigIntegerField(default=0)
    prompt_tokens = models.BigIntegerField(default=0)
    completion_tokens = models.BigIntegerField(default=0)
    request_count = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_usage_summaries"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "period_start", "period_type"],
                name="unique_user_period_summary",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} {self.period_type} {self.period_start}"


class UserPlanQuota(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="plan_quota",
        db_column="user_id",
        to_field="id",
    )
    plan_id = models.CharField(max_length=32, default="personal")
    monthly_token_limit = models.BigIntegerField(null=True, blank=True)
    monthly_request_limit = models.PositiveIntegerField(null=True, blank=True)
    tokens_used_this_period = models.BigIntegerField(default=0)
    requests_used_this_period = models.PositiveIntegerField(default=0)
    period_reset_at = models.DateTimeField()
    admin_override = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_plan_quotas"

    def __str__(self) -> str:
        return f"{self.user_id} {self.plan_id}"
