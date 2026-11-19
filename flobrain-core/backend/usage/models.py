import uuid
from django.db import models
from django.utils import timezone


class UserPlanQuota(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="plan_quota",
        db_column="user_id",
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

    def __str__(self):
        return f"{self.user_id} — {self.plan_id}"


class TokenUsageRecord(models.Model):
    PROVIDER_CHOICES = [
        ("openai", "OpenAI"),
        ("anthropic", "Anthropic"),
        ("google", "Google"),
        ("mock", "Mock"),
    ]
    REQUEST_TYPE_CHOICES = [
        ("chat_completion", "Chat completion"),
        ("embedding", "Embedding"),
        ("vision", "Vision"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="token_usage_records",
        db_column="user_id",
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
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"], name="token_usage_user_id_3ae36c_idx"),
            models.Index(fields=["user", "model"], name="token_usage_user_id_da8198_idx"),
        ]

    def __str__(self):
        return f"{self.user_id} — {self.model} — {self.total_tokens} tokens"


class UserUsageSummary(models.Model):
    PERIOD_CHOICES = [
        ("daily", "Daily"),
        ("monthly", "Monthly"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="usage_summaries",
        db_column="user_id",
    )
    period_start = models.DateField()
    period_end = models.DateField()
    period_type = models.CharField(max_length=16, choices=PERIOD_CHOICES)
    total_tokens = models.BigIntegerField(default=0)
    prompt_tokens = models.BigIntegerField(default=0)
    completion_tokens = models.BigIntegerField(default=0)
    request_count = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_usage_summaries"
        constraints = [
            models.UniqueConstraint(
                fields=("user", "period_start", "period_type"),
                name="unique_user_period_summary",
            )
        ]

    def __str__(self):
        return f"{self.user_id} — {self.period_type} {self.period_start}"
