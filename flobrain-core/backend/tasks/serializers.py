from rest_framework import serializers
from .models import Board, Task, TaskComment


class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)

    class Meta:
        model = TaskComment
        fields = ["id", "author_name", "body", "created_at"]
        read_only_fields = ["id", "created_at"]


class AssignedToSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()


class TaskListSerializer(serializers.ModelSerializer):
    assigned_to = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["id", "title", "status", "priority", "assigned_to", "due_date"]
        read_only_fields = ["id"]

    def get_assigned_to(self, obj):
        if obj.assigned_to:
            return {"id": obj.assigned_to.id, "name": obj.assigned_to.name}
        return None


class TaskDetailSerializer(serializers.ModelSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)
    assigned_to = serializers.SerializerMethodField()

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
        read_only_fields = ["id", "board", "created_by", "created_at", "updated_at"]

    def get_assigned_to(self, obj):
        if obj.assigned_to:
            return {"id": obj.assigned_to.id, "name": obj.assigned_to.name}
        return None


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["title", "description", "priority", "due_date"]

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value


class TaskUpdateSerializer(serializers.ModelSerializer):
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
        extra_kwargs = {field: {"required": False} for field in fields}

    def validate(self, data):
        assigned_to = data.get("assigned_to")
        if assigned_to and self.instance and self.instance.board:
            board = self.instance.board
            if board.board_type == Board.BOARD_TYPE_TEAM and board.team:
                if not board.team.members.filter(id=assigned_to.id).exists():
                    raise serializers.ValidationError(
                        {"assigned_to": "User is not a member of the board's team."}
                    )
        return data


class BoardSerializer(serializers.ModelSerializer):
    task_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Board
        fields = ["id", "name", "board_type", "task_count"]
        read_only_fields = ["id", "board_type", "task_count"]