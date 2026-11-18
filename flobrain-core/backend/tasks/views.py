from django.db.models import Count, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from teams.models import TeamMember
from users.models import User
from users.views import get_user_from_request

from .models import Board, Task
from .serializers import (
    BoardSerializer,
    TaskCreateSerializer,
    TaskDetailSerializer,
    TaskListSerializer,
    TaskUpdateSerializer,
)


class PersonalBoardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        board, created = Board.objects.get_or_create(
            board_type=Board.BOARD_TYPE_PERSONAL,
            owner=request.user,
            defaults={"name": f"{request.user.name}'s Personal Board"},
        )

        tasks = board.tasks.all()
        # Group tasks by status columns
        kanban_columns = {
            "backlog": [],
            "todo": [],
            "in_progress": [],
            "in_review": [],
            "done": [],
            "blocked": [],
        }

        for task in tasks:
            serializer = TaskListSerializer(task)
            col = task.status
            if col in kanban_columns:
                kanban_columns[col].append(serializer.data)

        board_data = BoardSerializer(board).data
        board_data["task_count"] = tasks.count()
        board_data["tasks"] = kanban_columns

        return Response(board_data, status=status.HTTP_200_OK)


class PersonalTaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        board, _ = Board.objects.get_or_create(
            board_type=Board.BOARD_TYPE_PERSONAL,
            owner=request.user,
            defaults={"name": f"{request.user.name}'s Personal Board"},
        )

        serializer = TaskCreateSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save(board=board, created_by=request.user)
            return Response(
                TaskDetailSerializer(task).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonalTaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, task_id, user):
        try:
            task = Task.objects.get(id=task_id, board__board_type="personal", board__owner=user)
            return task
        except Task.DoesNotExist:
            return None

    def patch(self, request, task_id):
        task = self.get_object(task_id, request.user)
        if not task:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check permission: user must be creator or assigned user
        if request.user != task.created_by and request.user != task.assigned_to:
            return Response(
                {"detail": "You do not have permission to edit this task."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TaskUpdateSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(TaskDetailSerializer(task).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, task_id):
        task = self.get_object(task_id, request.user)
        if not task:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != task.created_by and request.user != task.assigned_to:
            return Response(
                {"detail": "You do not have permission to delete this task."},
                status=status.HTTP_403_FORBIDDEN,
            )

        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TaskAssignmentView(APIView):
    """Assign or unassign a task after enforcing board access and role rules."""

    def get_accessible_task(self, task_id, user):
        try:
            task = Task.objects.select_related("board", "board__team", "created_by", "assigned_to").get(id=task_id)
        except Task.DoesNotExist:
            return None

        board = task.board
        if board.board_type == Board.BOARD_TYPE_PERSONAL:
            if board.owner_id != user.id:
                return None
        elif board.board_type == Board.BOARD_TYPE_TEAM:
            if not board.team or not TeamMember.objects.filter(team=board.team, user=user).exists():
                return None
        else:
            return None
        return task

    def post(self, request, task_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        task = self.get_accessible_task(task_id, user)
        if not task:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        board = task.board
        if board.board_type == Board.BOARD_TYPE_PERSONAL:
            if task.created_by_id != user.id:
                return Response({"detail": "Only the task creator can assign this task."}, status=status.HTTP_403_FORBIDDEN)
        else:
            if not TeamMember.objects.filter(team=board.team, user=user, role=TeamMember.ROLE_LEAD).exists():
                return Response({"detail": "Only team leads can assign this task."}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"user_id": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            assignee = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"user_id": "User not found."}, status=status.HTTP_400_BAD_REQUEST)

        if board.board_type == Board.BOARD_TYPE_TEAM:
            if not TeamMember.objects.filter(team=board.team, user=assignee).exists():
                return Response({"detail": "User is not a member of the board's team."}, status=status.HTTP_400_BAD_REQUEST)

        task.assigned_to = assignee
        task.save(update_fields=["assigned_to", "updated_at"])
        return Response(TaskDetailSerializer(task).data, status=status.HTTP_200_OK)

    def delete(self, request, task_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        task = self.get_accessible_task(task_id, user)
        if not task:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        board = task.board
        if board.board_type == Board.BOARD_TYPE_PERSONAL:
            if task.created_by_id != user.id:
                return Response({"detail": "Only the task creator can unassign this task."}, status=status.HTTP_403_FORBIDDEN)
        else:
            if not TeamMember.objects.filter(team=board.team, user=user, role=TeamMember.ROLE_LEAD).exists():
                return Response({"detail": "Only team leads can unassign this task."}, status=status.HTTP_403_FORBIDDEN)

        task.assigned_to = None
        task.save(update_fields=["assigned_to", "updated_at"])
        return Response(TaskDetailSerializer(task).data, status=status.HTTP_200_OK)


class AssignedToMeTaskListView(APIView):
    """List tasks assigned to the requesting user across accessible boards."""

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        team_ids = TeamMember.objects.filter(user=user).values_list("team_id", flat=True)
        tasks = Task.objects.filter(assigned_to=user).filter(
            Q(board__board_type=Board.BOARD_TYPE_PERSONAL)
            | Q(board__board_type=Board.BOARD_TYPE_TEAM, board__team_id__in=team_ids)
        ).order_by("due_date")
        return Response(TaskListSerializer(tasks, many=True).data, status=status.HTTP_200_OK)


class CreatedByMeTaskListView(APIView):
    """List tasks created by the requesting user on accessible boards."""

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        team_ids = TeamMember.objects.filter(user=user).values_list("team_id", flat=True)
        tasks = Task.objects.filter(created_by=user).filter(
            Q(board__board_type=Board.BOARD_TYPE_PERSONAL, board__owner=user)
            | Q(board__board_type=Board.BOARD_TYPE_TEAM, board__team_id__in=team_ids)
        ).order_by("-created_at")
        return Response(TaskListSerializer(tasks, many=True).data, status=status.HTTP_200_OK)