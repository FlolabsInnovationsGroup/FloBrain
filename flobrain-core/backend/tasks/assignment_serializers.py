"""
Serializers for the B4 Assignment API.

Kept in a separate module so B4 does not edit tasks/serializers.py,
which is being changed by the B1 PR. The ``assigned_to`` shape
({"id", "name"}) matches B1's TaskListSerializer so the two stay
compatible after B1 is merged.
"""
from rest_framework import serializers

from .models import Task


def _display_name(user):
    return getattr(user, "full_name", None) or user.username or user.email


class AssignTaskInputSerializer(serializers.Serializer):
    """Validates the body of POST /api/tasks/{task_id}/assign/."""

    user_id = serializers.UUIDField()


class AssignmentTaskSerializer(serializers.ModelSerializer):
    """Read-only task representation returned by the B4 endpoints."""

    assigned_to = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    board = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "board",
            "created_by",
            "assigned_to",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_assigned_to(self, obj):
        if obj.assigned_to is None:
            return None
        return {
            "id": str(obj.assigned_to.id),
            "name": _display_name(obj.assigned_to),
        }

    def get_created_by(self, obj):
        return str(obj.created_by_id)

    def get_board(self, obj):
        # Only basic board info; callers only receive tasks on boards
        # they can access (see views.accessible_tasks_for).
        return {
            "id": obj.board.id,
            "name": obj.board.name,
            "board_type": obj.board.board_type,
        }
