
import uuid

from datetime import timedelta

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Team, TeamMember, TeamActivity
from .serializers import (
    TeamListSerializer,
    TeamDetailSerializer,
    TeamCreateSerializer,
    TeamAddMemberSerializer,
)

from tasks.models import Board, Task
from users.views import get_user_from_request
from users.models import User


class TeamListCreateView(APIView):

    def get(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        teams = Team.objects.filter(
            Q(members__user=user) | Q(created_by=user)
        ).select_related("created_by").distinct()

        serializer = TeamListSerializer(teams, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = TeamCreateSerializer(
            data=request.data,
            context={"request": request, "user": user}
        )

        if serializer.is_valid():
            team = serializer.save()

            return Response(
                TeamDetailSerializer(team).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"error": "Validation failed", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class TeamDetailView(APIView):

    def get(self, request, team_id):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        team = Team.objects.filter(
            id=team_id,
            members__user=user
        ).select_related("created_by").distinct().first()

        if not team:
            return Response(
                {"error": "Team not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TeamDetailSerializer(team)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class TeamMemberView(APIView):

    def post(self, request, team_id):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        team = Team.objects.filter(id=team_id).first()

        if not team:
            return Response(
                {"error": "Team not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if not TeamMember.objects.filter(
            team=team, user=user, role="lead"
        ).exists():
            return Response(
                {"error": "Only team leads can add members"},
                status=status.HTTP_403_FORBIDDEN
            )

        requested_user_id = (
            request.data.get("user_id")
            if hasattr(request.data, "get")
            else None
        )

        if requested_user_id:
            try:
                parsed_user_id = uuid.UUID(str(requested_user_id))
            except (ValueError, TypeError, AttributeError):
                parsed_user_id = None

            if (
                parsed_user_id is not None
                and TeamMember.objects.filter(
                    team=team,
                    user_id=parsed_user_id,
                ).exists()
            ):
                return Response(
                    {"error": "User is already a member of this team"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = TeamAddMemberSerializer(
            data=request.data,
            context={"team": team}
        )

        if serializer.is_valid():

            member = serializer.save()

            TeamActivity.objects.create(
                team=team,
                actor=user,
                event_type="member_joined",
                description=f"{member.user.email} joined the team.",
                metadata={
                    "member_id": str(member.user.id),
                    "role": member.role,
                },
            )

            team = Team.objects.get(id=team.id)

            return Response(
                TeamDetailSerializer(team).data,
                status=status.HTTP_200_OK
            )

        non_field_errors = serializer.errors.get("non_field_errors", [])

        if any(
            "already a member of this team" in str(error)
            for error in non_field_errors
        ):
            return Response(
                {"error": "User is already a member of this team"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"error": "Validation failed", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, team_id, user_id):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        team = Team.objects.filter(id=team_id).first()

        if not team:
            return Response(
                {"error": "Team not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if not TeamMember.objects.filter(
            team=team, user=user, role="lead"
        ).exists():
            return Response(
                {"error": "Only team leads can remove members"},
                status=status.HTTP_403_FORBIDDEN
            )

        if user_id == user.id:
            return Response(
                {"error": "Team lead cannot remove themselves"},
                status=status.HTTP_400_BAD_REQUEST
            )

        member = TeamMember.objects.filter(
            team=team,
            user_id=user_id
        ).first()

        if not member:
            return Response(
                {"error": "Member not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        member.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamActivityPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class TeamActivityListView(APIView):
    """
    GET /api/teams/activity/

    Returns paginated team activities, newest first.
    """

    def get(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        team_ids = TeamMember.objects.filter(
            user=user
        ).values_list("team_id", flat=True)

        activities = TeamActivity.objects.filter(
            team_id__in=team_ids
        ).select_related(
            "team", "actor"
        ).order_by("-created_at")

        paginator = TeamActivityPagination()

        page = paginator.paginate_queryset(
            activities,
            request,
            view=self
        )

        results = []

        for activity in page:
            results.append({
                "id": activity.id,
                "team_id": activity.team_id,
                "team_name": activity.team.name,
                "actor_id": (
                    str(activity.actor.id)
                    if activity.actor else None
                ),
                "actor_email": (
                    activity.actor.email
                    if activity.actor else None
                ),
                "event_type": activity.event_type,
                "description": activity.description,
                "metadata": activity.metadata,
                "created_at": activity.created_at,
            })

        return paginator.get_paginated_response(results)


class TeamScorecardView(APIView):
    """
    GET /api/teams/scorecard/

    Returns leadership metrics for each team the user belongs to.
    """

    def get(self, request):
        user = get_user_from_request(request)

        if not user:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        teams = Team.objects.filter(
            members__user=user
        ).distinct()

        active_since = timezone.now() - timedelta(days=7)

        scorecards = []

        for team in teams:
            team_tasks = Task.objects.filter(
                board__team=team,
                board__board_type=Board.BOARD_TYPE_TEAM
            )

            total_tasks = team_tasks.count()

            completed_tasks = team_tasks.filter(
                status=Task.STATUS_DONE
            )

            completed_count = completed_tasks.count()

            completion_rate = (
                round((completed_count / total_tasks) * 100, 2)
                if total_tasks > 0 else 0
            )

            completed_with_due_date = completed_tasks.filter(
                due_date__isnull=False,
                completed_at__isnull=False
            )

            on_time_count = sum(
                1
                for task in completed_with_due_date
                if task.completed_at.date() <= task.due_date
            )

            on_time_total = completed_with_due_date.count()

            on_time_percentage = (
                round((on_time_count / on_time_total) * 100, 2)
                if on_time_total > 0 else 0
            )

            blockers_count = team_tasks.filter(
                status="blocked"
            ).count()

            team_members = TeamMember.objects.filter(
                team=team
            )

            total_members = team_members.count()

            active_members = team_members.filter(
                user__last_active__gte=active_since
            ).count()

            scorecards.append({
                "team_id": team.id,
                "team_name": team.name,
                "total_tasks": total_tasks,
                "completed_tasks": completed_count,
                "task_completion_rate": completion_rate,
                "on_time_delivery_percentage": on_time_percentage,
                "completed_tasks_with_due_date": on_time_total,
                "blockers_count": blockers_count,
                "total_members": total_members,
                "active_members": active_members,
                "active_member_activity": {
                    "active_members": active_members,
                    "total_members": total_members,
                    "period_days": 7,
                },
            })

        return Response({
            "results": scorecards,
        })
