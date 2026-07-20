import os

from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from users.views import get_user_from_request

from .serializers import (
    InternalUsageRecordSerializer,
    QuotaSerializer,
    UsageSummarySerializer,
)
from .services.aggregator import UsageAggregator
from .services.quota import QuotaEnforcer
from .services.recorder import TokenUsageData, UsageRecorder


def _get_user_or_401(request):
    user = get_user_from_request(request)
    if not user:
        return None, Response(
            {"error": "Authentication required", "details": "Valid Bearer token required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return user, None


class UsageSummaryView(APIView):
    def get(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err

        period = request.query_params.get("period", "7d")
        days = 7 if period in ("7d", "week") else 30 if period in ("30d", "month") else 7

        summary = UsageAggregator().get_period_summary(user, days=days)
        serializer = UsageSummarySerializer(summary)
        return Response(serializer.data)


class DailyUsageView(APIView):
    def get(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err

        try:
            days = int(request.query_params.get("days", 7))
        except ValueError:
            days = 7
        days = max(1, min(days, 90))

        data = UsageAggregator().get_daily_usage(user, days=days)
        return Response({"data": data})


class QuotaView(APIView):
    def get(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err

        result = QuotaEnforcer().check(user)
        payload = {
            "plan": result.plan,
            "limit_tokens": result.limit_tokens,
            "limit_requests": result.limit_requests,
            "used_tokens": result.used_tokens,
            "used_requests": result.used_requests,
            "remaining_tokens": result.remaining_tokens,
            "remaining_requests": result.remaining_requests,
            "reset_at": result.reset_at,
        }
        return Response(QuotaSerializer(payload).data)


class InternalUsageRecordView(APIView):
    """Service-to-service endpoint for flobrain-cloud usage reporting."""

    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        expected_key = getattr(settings, "INTERNAL_API_KEY", "") or os.environ.get(
            "INTERNAL_API_KEY", ""
        )
        provided = request.headers.get("X-Internal-Api-Key", "")
        if not expected_key or provided != expected_key:
            return Response(
                {"error": "Forbidden", "details": "Invalid internal API key"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = InternalUsageRecordSerializer(data=request.data or {})
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        try:
            user = User.objects.get(pk=data["user_id"])
        except User.DoesNotExist:
            return Response(
                {"error": "Not found", "details": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        usage = TokenUsageData(
            provider=data["provider"],
            model=data["model"],
            request_type=data["request_type"],
            prompt_tokens=data["prompt_tokens"],
            completion_tokens=data["completion_tokens"],
            total_tokens=data["total_tokens"],
            chat_id=data.get("chat_id"),
            message_id=data.get("message_id"),
            metadata=data.get("metadata") or {},
        )
        record = UsageRecorder().record(user, usage)
        return Response({"id": str(record.id)}, status=status.HTTP_201_CREATED)
