
from datetime import timedelta

from django.db.models import F, Q
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from teams.models import TeamMember
from users.views import get_user_from_request

from .models import Board, Task


def _user_name(user):
    if user is None:
        return None

    return user.username or user.email


@api_view(["GET"])
def task_reports(request):
    """
    Return task accomplishments, blockers, and upcoming deadlines.

    Optional query parameters:
    - team_id: Filter reports to one team.
    - scope: personal, team, or all (default: all).
    """

    user = get_user_from_request(request)

    if not user:
        return Response(
            {"detail": "Authentication required. Valid Bearer token required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    scope = request.query_params.get("scope", "all").lower()

    if scope not in ("personal", "team", "all"):
        return Response(
            {"detail": "Invalid scope. Use personal, team, or all."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    team_id = request.query_params.get("team_id")

    if team_id:
        try:
            team_id = int(team_id)
            if team_id <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response(
                {"detail": "team_id must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if scope == "personal":
            return Response(
                {"detail": "team_id cannot be combined with scope=personal."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_member = TeamMember.objects.filter(
            team_id=team_id,
            user=user,
        ).exists()

        if not is_member:
            return Response(
                {"detail": "You are not a member of this team."},
                status=status.HTTP_403_FORBIDDEN,
            )

    member_team_ids = TeamMember.objects.filter(
        user=user
    ).values_list("team_id", flat=True)

    personal_boards = Q(
        board__board_type=Board.BOARD_TYPE_PERSONAL,
        board__owner=user,
    )

    team_boards = Q(
        board__board_type=Board.BOARD_TYPE_TEAM,
        board__team_id__in=member_team_ids,
    )

    if team_id:
        accessible_boards = Q(
            board__board_type=Board.BOARD_TYPE_TEAM,
            board__team_id=team_id,
        )
    elif scope == "personal":
        accessible_boards = personal_boards
    elif scope == "team":
        accessible_boards = team_boards
    else:
        accessible_boards = personal_boards | team_boards

    tasks = Task.objects.filter(
        accessible_boards
    ).select_related(
        "board",
        "assigned_to",
        "completed_by",
    )

    now = timezone.now()
    seven_days_ago = now - timedelta(days=7)
    today = timezone.localdate()
    fourteen_days_from_now = today + timedelta(days=14)

    # Accomplishments: tasks completed/updated within the last 7 days.
    accomplishment_tasks = tasks.filter(
        status=Task.STATUS_DONE,
        updated_at__gte=seven_days_ago,
    ).order_by("-updated_at", "-id")[:20]

    accomplishments = [
        {
            "id": task.id,
            "title": task.title,
            "completed_by": _user_name(task.completed_by),
            "completed_at": (
                task.completed_at.isoformat()
                if task.completed_at
                else None
            ),
        }
        for task in accomplishment_tasks
    ]

    # Blockers: tasks currently marked as blocked.
    blocker_tasks = tasks.filter(
        status=Task.STATUS_BLOCKED,
    ).order_by(
        F("due_date").asc(nulls_last=True),
        "id",
    )[:20]

    blockers = [
        {
            "id": task.id,
            "title": task.title,
            "assigned_to": _user_name(task.assigned_to),
            "due_date": (
                task.due_date.isoformat()
                if task.due_date
                else None
            ),
            "board": task.board.name,
        }
        for task in blocker_tasks
    ]

    # Upcoming deadlines: due within the next 14 days,
    # including today, excluding completed tasks.
    deadline_tasks = tasks.filter(
        due_date__gte=today,
        due_date__lte=fourteen_days_from_now,
    ).exclude(
        status=Task.STATUS_DONE,
    ).order_by(
        "due_date",
        "id",
    )[:20]

    upcoming_deadlines = [
        {
            "id": task.id,
            "title": task.title,
            "due_date": task.due_date.isoformat(),
            "priority": task.priority,
            "assigned_to": _user_name(task.assigned_to),
        }
        for task in deadline_tasks
    ]

    return Response({
        "accomplishments": accomplishments,
        "blockers": blockers,
        "upcoming_deadlines": upcoming_deadlines,
    })
