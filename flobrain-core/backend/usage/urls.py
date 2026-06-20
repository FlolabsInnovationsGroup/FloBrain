from django.urls import path

from .views import (
    DailyUsageView,
    InternalUsageRecordView,
    QuotaView,
    UsageSummaryView,
)

urlpatterns = [
    path("api/usage/summary/", UsageSummaryView.as_view(), name="usage_summary"),
    path("api/usage/daily/", DailyUsageView.as_view(), name="usage_daily"),
    path("api/usage/quota/", QuotaView.as_view(), name="usage_quota"),
    path(
        "api/internal/usage/record/",
        InternalUsageRecordView.as_view(),
        name="internal_usage_record",
    ),
]
