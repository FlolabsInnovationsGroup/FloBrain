from django.urls import path
from . import views

urlpatterns = [
    path("personal/", views.personal_board, name="personal-board"),
    path(
        "personal/tasks/",
        views.create_personal_task,
        name="create-personal-task",
    ),
    path(
        "personal/tasks/<int:task_id>/",
        views.personal_task_detail,
        name="personal-task-detail",
    ),
    # B4: Assignment API
    path(
        "<int:task_id>/assign/",
        views.task_assign,
        name="task-assign",
    ),
    path(
        "assigned-to-me/",
        views.tasks_assigned_to_me,
        name="tasks-assigned-to-me",
    ),
    path(
        "created-by-me/",
        views.tasks_created_by_me,
        name="tasks-created-by-me",
    ),
]