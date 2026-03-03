from django.urls import path

from .views import DashboardHealthView, DashboardMemoryActivityView

urlpatterns = [
    path("api/dashboard/health/", DashboardHealthView.as_view(), name="dashboard_health"),
    path("api/dashboard/memory-activity/", DashboardMemoryActivityView.as_view(), name="dashboard_memory_activity"),
]
