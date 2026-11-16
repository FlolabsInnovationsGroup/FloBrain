
from django.urls import path

from . import report_views


urlpatterns = [
    path(
        "tasks/",
        report_views.task_reports,
        name="task-reports",
    ),
]
