from django.urls import path
from .views import UsageQuotaView, UsageRecordsView, UsageSummaryView

urlpatterns = [
    path("quota/", UsageQuotaView.as_view(), name="usage-quota"),
    path("records/", UsageRecordsView.as_view(), name="usage-records"),
    path("summary/", UsageSummaryView.as_view(), name="usage-summary"),
]
