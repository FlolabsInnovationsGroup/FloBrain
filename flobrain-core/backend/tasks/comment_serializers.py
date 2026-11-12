"""
Serializers for the B6 Task Comments API.

Kept in a separate module so B6 does not edit tasks/serializers.py,
which is being changed by the B1 PR. The output fields are a superset of
B1's TaskCommentSerializer (id, author_name, body, created_at) so the
comments endpoint and B1's nested TaskDetailSerializer comments look the
same to the frontend.
"""
from rest_framework import serializers

from .models import TaskComment


class CommentCreateSerializer(serializers.Serializer):
    """Validates the body of POST /api/tasks/{task_id}/comments/.

    Only ``body`` is accepted. The author and task come from the request
    and URL, never from user input.
    """

    # CharField trims whitespace and rejects blank values by default,
    # so "" and "   " both return 400.
    body = serializers.CharField()


class CommentSerializer(serializers.ModelSerializer):
    """Read-only comment representation returned by the B6 endpoints."""

    author = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskComment
        fields = ["id", "author", "author_name", "body", "created_at"]
        read_only_fields = fields

    def get_author(self, obj):
        return str(obj.author_id)

    def get_author_name(self, obj):
        return (
            getattr(obj.author, "full_name", None)
            or obj.author.username
            or obj.author.email
        )
