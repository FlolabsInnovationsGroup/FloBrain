from rest_framework import serializers
from .models import TokenUsageRecord, UserPlanQuota, UserUsageSummary


class TokenUsageRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenUsageRecord
        fields = [
            "id",
            "provider",
            "model",
            "request_type",
            "prompt_tokens",
            "completion_tokens",
            "total_tokens",
            "estimated_cost_usd",
            "created_at",
        ]
        read_only_fields = fields


class UserPlanQuotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPlanQuota
        fields = [
            "plan_id",
            "monthly_token_limit",
            "monthly_request_limit",
            "tokens_used_this_period",
            "requests_used_this_period",
            "period_reset_at",
        ]
        read_only_fields = fields


class UserUsageSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserUsageSummary
        fields = [
            "id",
            "period_start",
            "period_end",
            "period_type",
            "total_tokens",
            "prompt_tokens",
            "completion_tokens",
            "request_count",
        ]
        read_only_fields = fields
