from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.views import get_user_from_request
from .models import TokenUsageRecord, UserPlanQuota, UserUsageSummary
from .serializers import (
    TokenUsageRecordSerializer,
    UserPlanQuotaSerializer,
    UserUsageSummarySerializer,
)


class UsageQuotaView(APIView):
    """GET the requesting user's current plan quota and period usage."""

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            quota = UserPlanQuota.objects.get(user=user)
        except UserPlanQuota.DoesNotExist:
            return Response(
                {"error": "No quota record found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(UserPlanQuotaSerializer(quota).data)


class UsageRecordsView(APIView):
    """GET a paginated list of the requesting user's token usage records."""

    PAGE_SIZE = 50

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        records = TokenUsageRecord.objects.filter(user=user).order_by("-created_at")[
            : self.PAGE_SIZE
        ]
        return Response(TokenUsageRecordSerializer(records, many=True).data)


class UsageSummaryView(APIView):
    """GET aggregated usage summaries for the requesting user.

    Optional query params:
      period_type=daily|monthly   (defaults to both)
      limit=N                     (max rows; default 12)
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        qs = UserUsageSummary.objects.filter(user=user).order_by("-period_start")
        period_type = request.query_params.get("period_type")
        if period_type in ("daily", "monthly"):
            qs = qs.filter(period_type=period_type)
        try:
            limit = int(request.query_params.get("limit", 12))
            limit = max(1, min(limit, 100))
        except (TypeError, ValueError):
            limit = 12
        return Response(UserUsageSummarySerializer(qs[:limit], many=True).data)
