from rest_framework import serializers

from usage.models import TokenUsageRecord


class UsageSummarySerializer(serializers.Serializer):
    total_tokens = serializers.IntegerField()
    change_percent = serializers.FloatField()
    period_start = serializers.CharField()
    period_end = serializers.CharField()
    breakdown_by_model = serializers.ListField(child=serializers.DictField())


class DailyUsageItemSerializer(serializers.Serializer):
    date = serializers.CharField()
    total_tokens = serializers.IntegerField()
    request_count = serializers.IntegerField()


class QuotaSerializer(serializers.Serializer):
    plan = serializers.CharField()
    limit_tokens = serializers.IntegerField(allow_null=True)
    limit_requests = serializers.IntegerField(allow_null=True)
    used_tokens = serializers.IntegerField()
    used_requests = serializers.IntegerField()
    remaining_tokens = serializers.IntegerField(allow_null=True)
    remaining_requests = serializers.IntegerField(allow_null=True)
    reset_at = serializers.DateTimeField()


class InternalUsageRecordSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    provider = serializers.CharField(max_length=32)
    model = serializers.CharField(max_length=128)
    request_type = serializers.CharField(max_length=32)
    prompt_tokens = serializers.IntegerField(min_value=0)
    completion_tokens = serializers.IntegerField(min_value=0)
    total_tokens = serializers.IntegerField(min_value=0)
    chat_id = serializers.IntegerField(required=False, allow_null=True)
    message_id = serializers.IntegerField(required=False, allow_null=True)
    metadata = serializers.DictField(required=False, default=dict)

    def validate_provider(self, value: str) -> str:
        valid = {c[0] for c in TokenUsageRecord.PROVIDER_CHOICES}
        if value not in valid:
            raise serializers.ValidationError(f"Invalid provider. Must be one of: {valid}")
        return value

    def validate_request_type(self, value: str) -> str:
        valid = {c[0] for c in TokenUsageRecord.REQUEST_TYPE_CHOICES}
        if value not in valid:
            raise serializers.ValidationError(f"Invalid request_type. Must be one of: {valid}")
        return value
