from django.contrib import admin

from .models import Board, Task, TaskComment


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ("name", "board_type", "owner", "team", "created_at")
    list_filter = ("board_type",)
    search_fields = ("name",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "priority", "board", "created_by", "assigned_to", "due_date")
    list_filter = ("status", "priority", "board")
    search_fields = ("title", "description")


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ("task", "author", "created_at")
    search_fields = ("body",)
