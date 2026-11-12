
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from users.views import get_user_from_request

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
