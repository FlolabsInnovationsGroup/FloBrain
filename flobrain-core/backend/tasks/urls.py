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
]