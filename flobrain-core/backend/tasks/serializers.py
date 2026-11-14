
from rest_framework import serializers

from .models import Board, Task, TaskComment
from users.models import User
from teams.models import TeamMember


class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    def get_author_name(self, obj):
        return (
            getattr(obj.author, "full_name", None)
            or obj.author.username
            or obj.author.email
        )

    class Meta:
        model = TaskComment
        fields = ["id", "author_name", "body", "created_at"]
        read_only_fields = ["id", "author_name", "created_at"]


class TaskListSerializer(serializers.ModelSerializer):
    assigned_to = serializers.SerializerMethodField()

    def get_assigned_to(self, obj):
        if not obj.assigned_to:
            return None

        return {
            "id": obj.assigned_to.id,
            "name": (
                getattr(obj.assigned_to, "full_name", None)
                or obj.assigned_to.username
                or obj.assigned_to.email
            ),
        }

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "status",
            "priority",
            "assigned_to",
            "due_date",
        ]
        read_only_fields = fields


class TaskDetailSerializer(serializers.ModelSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "board",
            "created_by",
            "assigned_to",
            "due_date",
            "created_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = [
            "id",
            "board",
            "created_by",
            "created_at",
            "updated_at",
            "comments",
        ]


class TaskCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ["title", "description", "priority", "due_date"]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")

        return value


class TaskUpdateSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Task
        fields = [
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "assigned_to",
        ]

    def validate_assigned_to(self, assigned_to):
        board = self.instance.board

        if (
            assigned_to is not None
            and board.board_type == Board.BOARD_TYPE_TEAM
            and not TeamMember.objects.filter(
                team=board.team,
                user=assigned_to,
            ).exists()
        ):
            raise serializers.ValidationError(
                "Assigned user must be a member of this team."
            )

        return assigned_to


class BoardSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()

    def get_task_count(self, obj):
        return obj.tasks.count()

    class Meta:
        model = Board
        fields = ["id", "name", "board_type", "task_count"]
        read_only_fields = fields


# Kept for compatibility with the existing B2 views.
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
