from django.urls import path

from .views import (
    AssignedToMeTaskListView,
    CreatedByMeTaskListView,
    TaskAssignmentView,
)

urlpatterns = [
    path("assigned-to-me/", AssignedToMeTaskListView.as_view(), name="tasks-assigned-to-me"),
    path("created-by-me/", CreatedByMeTaskListView.as_view(), name="tasks-created-by-me"),
    path("<int:task_id>/assign/", TaskAssignmentView.as_view(), name="task-assignment"),
]
