"""
B6: Task Comments API.

- GET    /api/tasks/{task_id}/comments/
- POST   /api/tasks/{task_id}/comments/
- DELETE /api/tasks/{task_id}/comments/{comment_id}/

Board access uses the same rules as the B4 Assignment API
(see views.accessible_tasks_for):
- personal boards: board owner, task creator or task assignee;
- team boards: current TeamMember of the board's team.

Unlike B4, B6 returns 403 (not 404) for an existing task the user
cannot access, as the B6 spec requires.
"""
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from users.views import get_user_from_request

from .comment_serializers import CommentCreateSerializer, CommentSerializer
from .models import Task, TaskComment
from .views import accessible_tasks_for


def _unauthorized():
    return Response(
        {"detail": "Authentication required. Valid Bearer token required."},
        status=status.HTTP_401_UNAUTHORIZED,
    )


def _forbidden():
    return Response(
        {"detail": "You do not have access to this task's board."},
        status=status.HTTP_403_FORBIDDEN,
    )


def _has_board_access(user, task):
    return accessible_tasks_for(user).filter(pk=task.pk).exists()


@api_view(["GET", "POST"])
def task_comments(request, task_id):
    user = get_user_from_request(request)
    if not user:
        return _unauthorized()

    task = get_object_or_404(Task, id=task_id)
    if not _has_board_access(user, task):
        return _forbidden()

    if request.method == "GET":
        comments = (
            TaskComment.objects.filter(task=task)
            .select_related("author")
            .order_by("created_at", "id")
        )
        return Response(CommentSerializer(comments, many=True).data)

    serializer = CommentCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    comment = TaskComment.objects.create(
        task=task,
        author=user,
        body=serializer.validated_data["body"],
    )
    return Response(
        CommentSerializer(comment).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
def task_comment_detail(request, task_id, comment_id):
    user = get_user_from_request(request)
    if not user:
        return _unauthorized()

    task = get_object_or_404(Task, id=task_id)
    if not _has_board_access(user, task):
        return _forbidden()

    # Filtering by task as well means a comment from another task is a 404.
    comment = get_object_or_404(TaskComment, id=comment_id, task=task)

    if comment.author_id != user.id:
        return Response(
            {"detail": "Only the comment author can delete this comment."},
            status=status.HTTP_403_FORBIDDEN,
        )

    comment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
