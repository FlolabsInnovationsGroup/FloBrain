
from django.contrib import admin
from .models import Board, Task, TaskComment


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "board_type", "owner", "team", "created_at")
    list_filter = ("board_type",)
    search_fields = ("name",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "status",
        "priority",
        "board",
        "assigned_to",
        "due_date",
    )
    list_filter = ("status", "priority")
    search_fields = ("title", "description")


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ("id", "task", "author", "created_at")
    search_fields = ("body",)
