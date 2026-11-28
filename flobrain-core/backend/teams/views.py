import uuid
from datetime import timedelta

from django.core.paginator import Paginator
from django.db.models import Count, Q
from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from docs.models import Document, DocumentAttachment
from projects.models import Project
from tasks.models import Board, Task

from .models import Team, TeamMember
from .serializers import (
    TeamListSerializer,
    TeamDetailSerializer,
    TeamCreateSerializer,
    TeamAddMemberSerializer,
)
from users.views import get_user_from_request
from users.models import User


def _accessible_teams(user):
    return Team.objects.filter(
        Q(members__user=user) | Q(created_by=user)
    ).select_related("created_by").distinct()


def _display_name(user):
    if not user:
        return None
    return getattr(user, "full_name", None) or getattr(user, "username", None) or user.email


def _bounded_int(value, default, minimum, maximum):
    try:
        return max(minimum, min(int(value), maximum))
    except (TypeError, ValueError):
        return default


def _actor_payload(user):
    if not user:
        return {"id": None, "name": None}
    return {"id": str(user.id), "name": _display_name(user)}


class TeamListCreateView(APIView):

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
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

        requested_user_id = request.data.get("user_id") if hasattr(request.data, "get") else None
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
            serializer.save()
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

        member = TeamMember.objects.filter(team=team, user_id=user_id).first()
        if not member:
            return Response(
                {"error": "Member not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamScorecardView(APIView):
    """GET /api/teams/scorecard/ - aggregated metrics for accessible teams."""

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        activity_days = _bounded_int(
            request.query_params.get("days", 30), 30, 1, 365
        )
        active_since = timezone.now() - timedelta(days=activity_days)
        teams = _accessible_teams(user).prefetch_related("members")

        scorecards = []
        for team in teams:
            tasks = Task.objects.filter(
                board__team=team,
                board__board_type=Board.BOARD_TYPE_TEAM,
            )

            task_totals = tasks.aggregate(
                total=Count("id"),
                completed=Count("id", filter=Q(status=Task.STATUS_DONE)),
                blocked=Count("id", filter=Q(status=Task.STATUS_BLOCKED)),
            )

            total_tasks = task_totals["total"]
            completed_count = task_totals["completed"]
            completion_rate = round(
                (completed_count / total_tasks * 100) if total_tasks else 0,
                2,
            )

            due_completed = tasks.filter(
                status=Task.STATUS_DONE,
                due_date__isnull=False,
            ).only("due_date", "completed_at", "updated_at")
            due_count = due_completed.count()
            on_time_count = sum(
                1
                for task in due_completed
                if (task.completed_at or task.updated_at).date() <= task.due_date
            )
            on_time_percentage = round(
                (on_time_count / due_count * 100) if due_count else 0,
                2,
            )

            active_user_ids = set(
                tasks.filter(updated_at__gte=active_since)
                .exclude(assigned_to=None)
                .values_list("assigned_to_id", flat=True)
            )
            active_user_ids.update(
                tasks.filter(updated_at__gte=active_since)
                .exclude(created_by=None)
                .values_list("created_by_id", flat=True)
            )
            active_user_ids.update(
                tasks.filter(
                    status=Task.STATUS_DONE,
                    completed_at__gte=active_since,
                ).exclude(completed_by=None).values_list("completed_by_id", flat=True)
            )

            active_member_count = team.members.filter(
                user_id__in=active_user_ids
            ).count()

            scorecards.append({
                "team_id": team.id,
                "team_name": team.name,
                "task_completion_rate": completion_rate,
                "on_time_delivery_percentage": on_time_percentage,
                "blockers_count": task_totals["blocked"],
                "active_member_activity": active_member_count,
            })

        return Response(scorecards)


class TeamActivityView(APIView):
    """GET /api/teams/activity/ - paginated leadership activity for accessible teams."""

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        teams = list(_accessible_teams(user).prefetch_related("members__user"))
        team_by_id = {team.id: team for team in teams}

        events = []

        for team in teams:
            board_ids = team.boards.filter(
                board_type=Board.BOARD_TYPE_TEAM
            ).values_list("id", flat=True)

            for task in Task.objects.filter(
                board_id__in=board_ids,
                status=Task.STATUS_DONE,
                completed_at__isnull=False,
            ).select_related("completed_by", "created_by"):
                actor = task.completed_by or task.created_by
                events.append({
                    "id": f"task-completed-{task.id}",
                    "event_type": "task_completed",
                    "type": "task_completed",
                    "team_id": team.id,
                    "team_name": team.name,
                    "actor": {
                        "id": str(actor.id) if actor else None,
                        "name": _display_name(actor),
                    },
                    "title": task.title,
                    "description": f"Completed task: {task.title}",
                    "timestamp": task.completed_at,
                    "metadata": {"task_id": task.id, "status": task.status},
                })

            for membership in team.members.select_related("user"):
                events.append({
                    "id": f"member-joined-{team.id}-{membership.user_id}",
                    "event_type": "member_joined",
                    "type": "member_joined",
                    "team_id": team.id,
                    "team_name": team.name,
                    "actor": {
                        "id": str(membership.user_id),
                        "name": _display_name(membership.user),
                    },
                    "title": _display_name(membership.user),
                    "description": f"Joined team {team.name}",
                    "timestamp": membership.joined_at,
                    "metadata": {"role": membership.role},
                })

            for project in team.team_projects.select_related("created_by", "team_lead"):
                actor = project.team_lead or project.created_by
                events.append({
                    "id": f"project-status-{project.id}-{project.status}",
                    "event_type": "project_status_changed",
                    "type": "project_status_changed",
                    "team_id": team.id,
                    "team_name": team.name,
                    "actor": {
                        "id": str(actor.id) if actor else None,
                        "name": _display_name(actor),
                    },
                    "title": project.name,
                    "description": f"Project status changed to {project.status.replace('_', ' ')}",
                    "timestamp": project.updated_at,
                    "metadata": {"project_id": project.id, "status": project.status},
                })

        team_member_users = set()
        user_team_ids = {}
        memberships = TeamMember.objects.filter(
            team_id__in=[team.id for team in teams]
        ).select_related("user")
        for membership in memberships:
            team_member_users.add(membership.user_id)
            user_team_ids.setdefault(membership.user_id, set()).add(membership.team_id)

        for document in Document.objects.filter(owner_id__in=team_member_users).select_related("owner"):
            for team_id in user_team_ids.get(document.owner_id, set()):
                team = team_by_id.get(team_id)
                if not team:
                    continue
                events.append({
                    "id": f"document-upload-{document.id}-{team.id}",
                    "event_type": "document_uploaded",
                    "type": "document_uploaded",
                    "team_id": team.id,
                    "team_name": team.name,
                    "actor": {
                        "id": str(document.owner_id),
                        "name": _display_name(document.owner),
                    },
                    "title": document.title,
                    "description": f"Uploaded document: {document.title}",
                    "timestamp": document.created_at,
                    "metadata": {"document_id": document.id},
                })

        for attachment in DocumentAttachment.objects.filter(
            uploaded_by_id__in=team_member_users
        ).select_related("uploaded_by"):
            for team_id in user_team_ids.get(attachment.uploaded_by_id, set()):
                team = team_by_id.get(team_id)
                if not team:
                    continue
                events.append({
                    "id": f"attachment-upload-{attachment.id}-{team.id}",
                    "event_type": "document_uploaded",
                    "type": "document_uploaded",
                    "team_id": team.id,
                    "team_name": team.name,
                    "actor": _actor_payload(attachment.uploaded_by),
                    "title": attachment.name,
                    "description": f"Uploaded document attachment: {attachment.name}",
                    "timestamp": attachment.created_at,
                    "metadata": {"attachment_id": attachment.id},
                })

        events.sort(key=lambda event: event["timestamp"], reverse=True)

        page = _bounded_int(request.query_params.get("page", 1), 1, 1, 2**31 - 1)
        page_size = _bounded_int(request.query_params.get("page_size", 20), 20, 1, 100)

        paginator = Paginator(events, page_size)
        page_number = min(page, paginator.num_pages)
        current_page = paginator.page(page_number)

        return Response({
            "count": paginator.count,
            "next": current_page.next_page_number() if current_page.has_next() else None,
            "previous": current_page.previous_page_number() if current_page.has_previous() else None,
            "results": list(current_page.object_list),
        })
