from rest_framework import serializers

from teams.models import TeamMember
from users.models import User

from .models import Board, Task, TaskComment


def user_display_name(user):
    full_name = getattr(user, "full_name", None)
    if isinstance(full_name, str) and full_name.strip():
        return full_name.strip()

    username = getattr(user, "username", None)
    if isinstance(username, str) and username.strip():
        return username.strip()

    return user.email


class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskComment
        fields = ["id", "author_name", "body", "created_at"]
        read_only_fields = ["id", "author_name", "created_at"]

    def get_author_name(self, obj):
        return user_display_name(obj.author)


class TaskListSerializer(serializers.ModelSerializer):
    assigned_to = serializers.SerializerMethodField()

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

    def get_assigned_to(self, obj):
        user = obj.assigned_to
        if user is None:
            return None

        return {
            "id": str(user.id),
            "name": user_display_name(user),
        }


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
            "completed_at",
            "completed_by",
            "comments",
        ]
        read_only_fields = [
            "id", "created_at", "updated_at", "completed_at", "completed_by", "comments"
        ]


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["title", "description", "priority", "due_date"]
        extra_kwargs = {
            "title": {
                "write_only": True,
                "allow_blank": True,
                "trim_whitespace": False,
            },
            "description": {
                "write_only": True,
                "required": False,
                "allow_blank": True,
            },
            "priority": {
                "write_only": True,
                "required": False,
            },
            "due_date": {
                "write_only": True,
                "required": False,
                "allow_null": True,
            },
        }

    def validate_title(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Title cannot be blank.")
        return cleaned

    def validate(self, attrs):
        errors = {}
        if "board" in self.initial_data:
            errors["board"] = "This field cannot be set by the client."
        if "created_by" in self.initial_data:
            errors["created_by"] = "This field cannot be set by the client."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs


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
        extra_kwargs = {
            "title": {"required": False},
            "description": {"required": False},
            "status": {"required": False},
            "priority": {"required": False},
            "due_date": {"required": False, "allow_null": True},
        }

    def _get_board(self):
        if self.instance is not None and self.instance.board_id:
            return self.instance.board
        return self.context.get("board")

    def validate_assigned_to(self, assigned_to):
        if assigned_to is None:
            return assigned_to

        board = self._get_board()
        if board is None:
            raise serializers.ValidationError(
                "A board is required to validate the assigned user."
            )

        if board.board_type == Board.BOARD_TYPE_TEAM:
            is_member = TeamMember.objects.filter(
                team_id=board.team_id,
                user=assigned_to,
            ).exists()
            if not is_member:
                raise serializers.ValidationError(
                    "Assigned user is not a member of this team."
                )

        return assigned_to


class BoardSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ["id", "name", "board_type", "task_count"]
        read_only_fields = ["id", "task_count"]

    def get_task_count(self, obj):
        annotated = obj.__dict__.get("task_count")
        if annotated is not None:
            return annotated
        return obj.tasks.count()


# Kanban views still read and write tasks through this serializer.
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
