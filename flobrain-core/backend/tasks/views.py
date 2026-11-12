
from django.db.models import F, Q
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from teams.models import TeamMember
from users.models import User
from users.views import get_user_from_request

from .assignment_serializers import (
    AssignmentTaskSerializer,
    AssignTaskInputSerializer,
)
from .models import Board, Task
from .serializers import TaskSerializer, TaskUpdateSerializer


def get_personal_board(user):
    board, created = Board.objects.get_or_create(
        owner=user,
        board_type=Board.BOARD_TYPE_PERSONAL,
        defaults={"name": "Personal Board"},
    )
    return board


@api_view(["GET"])
def personal_board(request):
    user = get_user_from_request(request)

    if not user:
        return Response(
            {"detail": "Authentication required. Valid Bearer token required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    board = get_personal_board(user)
    tasks = Task.objects.filter(board=board)

    grouped_tasks = {
        status_value: TaskSerializer(
            tasks.filter(status=status_value),
            many=True,
        ).data
        for status_value, _ in Task.STATUS_CHOICES
    }

    return Response({
        "id": board.id,
        "name": board.name,
        "board_type": board.board_type,
        "created_at": board.created_at,
        "tasks": grouped_tasks,
    })


@api_view(["POST"])
def create_personal_task(request):
    user = get_user_from_request(request)

    if not user:
        return Response(
            {"detail": "Authentication required. Valid Bearer token required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    board = get_personal_board(user)
    serializer = TaskSerializer(data=request.data)

    if serializer.is_valid():
        task = serializer.save(
            board=board,
            created_by=user,
        )
        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["PATCH", "DELETE"])
def personal_task_detail(request, task_id):
    user = get_user_from_request(request)

    if not user:
        return Response(
            {"detail": "Authentication required. Valid Bearer token required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    task = get_object_or_404(
        Task,
        id=task_id,
        board__board_type=Board.BOARD_TYPE_PERSONAL,
    )

    if task.created_by_id != user.id and task.assigned_to_id != user.id:
        return Response(
            {"detail": "You do not have permission to modify this task."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "PATCH":
        serializer = TaskUpdateSerializer(
            task,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()
            return Response(TaskSerializer(task).data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    task.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# B4: Assignment API
# ---------------------------------------------------------------------------

TEAM_ROLE_LEAD = "lead"


def _unauthorized():
    return Response(
        {"detail": "Authentication required. Valid Bearer token required."},
        status=status.HTTP_401_UNAUTHORIZED,
    )


def accessible_tasks_for(user):
    """
    Tasks the user is allowed to see:
    - personal boards: the user owns the board, created the task,
      or is assigned to it;
    - team boards: the user is currently a member of the board's team.
    """
    member_team_ids = TeamMember.objects.filter(user=user).values("team_id")

    personal = Q(board__board_type=Board.BOARD_TYPE_PERSONAL) & (
        Q(board__owner=user) | Q(created_by=user) | Q(assigned_to=user)
    )
    team = Q(
        board__board_type=Board.BOARD_TYPE_TEAM,
        board__team_id__in=member_team_ids,
    )

    return Task.objects.filter(personal | team).select_related(
        "board", "assigned_to"
    )


def _can_manage_assignment(user, task):
    board = task.board

    if board.board_type == Board.BOARD_TYPE_PERSONAL:
        return task.created_by_id == user.id

    return TeamMember.objects.filter(
        team_id=board.team_id,
        user=user,
        role=TEAM_ROLE_LEAD,
    ).exists()


@api_view(["POST", "DELETE"])
def task_assign(request, task_id):
    user = get_user_from_request(request)

    if not user:
        return _unauthorized()

    # 404 both when the task does not exist and when it is on a board
    # the user cannot access, so task IDs are not leaked.
    task = get_object_or_404(accessible_tasks_for(user), id=task_id)

    if not _can_manage_assignment(user, task):
        if task.board.board_type == Board.BOARD_TYPE_PERSONAL:
            detail = "Only the task creator can change its assignment."
        else:
            detail = "Only a team lead can change task assignments."
        return Response({"detail": detail}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "DELETE":
        task.assigned_to = None
        task.save(update_fields=["assigned_to", "updated_at"])
        return Response(AssignmentTaskSerializer(task).data)

    input_serializer = AssignTaskInputSerializer(data=request.data)
    if not input_serializer.is_valid():
        return Response(
            input_serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    assignee = User.objects.filter(
        id=input_serializer.validated_data["user_id"]
    ).first()
    if assignee is None:
        return Response(
            {"user_id": ["User not found."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if (
        task.board.board_type == Board.BOARD_TYPE_TEAM
        and not TeamMember.objects.filter(
            team_id=task.board.team_id,
            user=assignee,
        ).exists()
    ):
        return Response(
            {"user_id": ["Assigned user must be a member of this team."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    task.assigned_to = assignee
    task.save(update_fields=["assigned_to", "updated_at"])
    return Response(AssignmentTaskSerializer(task).data)


@api_view(["GET"])
def tasks_assigned_to_me(request):
    user = get_user_from_request(request)

    if not user:
        return _unauthorized()

    tasks = accessible_tasks_for(user).filter(assigned_to=user).order_by(
        F("due_date").asc(nulls_last=True),
        "id",
    )
    return Response(AssignmentTaskSerializer(tasks, many=True).data)


@api_view(["GET"])
def tasks_created_by_me(request):
    user = get_user_from_request(request)

    if not user:
        return _unauthorized()

    tasks = accessible_tasks_for(user).filter(created_by=user).order_by(
        "-created_at",
        "-id",
    )
    return Response(AssignmentTaskSerializer(tasks, many=True).data)
