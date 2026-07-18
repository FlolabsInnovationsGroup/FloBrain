"""memory/team_views.py — CRUD endpoints for Team + team-scoped memories.

Routes (registered in urls.py):
    POST   /api/teams/                          — create team
    GET    /api/teams/                          — list user's teams
    GET    /api/teams/{id}/                     — get team detail
    POST   /api/teams/{id}/members/             — add member
    DELETE /api/teams/{id}/members/{user_id}    — remove member
    GET    /api/teams/{id}/memories/            — list team memories
    POST   /api/teams/{id}/memories/            — create team memory
    DELETE /api/teams/{id}/memories/{memory_id} — delete team memory

ACL:
  - Only team members can list team memories
  - Only admin role can add/remove members and create/delete team memories
  - owner_id of the memory is set to acting user; team is set from URL
"""
import uuid
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import MemoryNode, Team, TeamMembership
from .sorter import distribute_to_tiers

logger = logging.getLogger(__name__)


def _get_user_or_401(request):
    try:
        from users.views import get_user_from_request
    except ImportError:
        return None, Response(
            {"error": "Auth module unavailable"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    user = get_user_from_request(request)
    if not user:
        return None, Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return user, None


def _get_user_teams(user_id: str) -> list:
    """Returns list of team IDs the user is a member of."""
    return list(TeamMembership.objects.filter(user_id=user_id).values_list('team_id', flat=True))


def _is_team_member(team_id: str, user_id: str) -> bool:
    return TeamMembership.objects.filter(team_id=team_id, user_id=user_id).exists()


def _is_team_admin(team_id: str, user_id: str) -> bool:
    return TeamMembership.objects.filter(
        team_id=team_id, user_id=user_id, role__in=["admin"]
    ).exists()


class TeamListCreateView(APIView):
    """GET /api/teams/ — list user's teams. POST /api/teams/ — create team."""

    def get(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        user_id = str(user.id)
        team_ids = _get_user_teams(user_id)
        teams = Team.objects.filter(id__in=team_ids).values('id', 'name', 'description', 'created_at')
        return Response({"teams": list(teams), "count": len(teams)})

    def post(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"error": "Field 'name' is required"}, status=status.HTTP_400_BAD_REQUEST)
        team_id = request.data.get("id") or f"team_{uuid.uuid4().hex[:16]}"
        team = Team.objects.create(
            id=team_id,
            name=name,
            owner_id=str(user.id),
            description=request.data.get("description", ""),
        )
        # Creator becomes admin
        TeamMembership.objects.create(team=team, user_id=str(user.id), role="admin")
        return Response({
            "id": team.id, "name": team.name, "owner_id": team.owner_id,
            "created_at": team.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class TeamDetailView(APIView):
    """GET /api/teams/{id}/ — team detail with members."""

    def get(self, request, team_id):
        user, err = _get_user_or_401(request)
        if err:
            return err
        if not _is_team_member(team_id, str(user.id)):
            return Response({"error": "Not a team member"}, status=status.HTTP_403_FORBIDDEN)
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"error": "Team not found"}, status=status.HTTP_404_NOT_FOUND)
        members = TeamMembership.objects.filter(team_id=team_id).values('user_id', 'role', 'joined_at')
        return Response({
            "id": team.id, "name": team.name, "description": team.description,
            "owner_id": team.owner_id,
            "members": list(members),
            "created_at": team.created_at.isoformat(),
        })


class TeamMemberView(APIView):
    """POST /api/teams/{id}/members/ — add member. DELETE /api/teams/{id}/members/{user_id} — remove."""

    def post(self, request, team_id):
        user, err = _get_user_or_401(request)
        if err:
            return err
        if not _is_team_admin(team_id, str(user.id)):
            return Response({"error": "Admin role required"}, status=status.HTTP_403_FORBIDDEN)
        new_user_id = request.data.get("user_id", "").strip()
        role = request.data.get("role", "member")
        if not new_user_id:
            return Response({"error": "Field 'user_id' is required"}, status=status.HTTP_400_BAD_REQUEST)
        membership, created = TeamMembership.objects.get_or_create(
            team_id=team_id, user_id=new_user_id,
            defaults={"role": role}
        )
        if not created:
            membership.role = role
            membership.save(update_fields=["role"])
        return Response({
            "team_id": team_id, "user_id": new_user_id,
            "role": role, "created": created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, team_id, user_id):
        user, err = _get_user_or_401(request)
        if err:
            return err
        if not _is_team_admin(team_id, str(user.id)):
            return Response({"error": "Admin role required"}, status=status.HTTP_403_FORBIDDEN)
        deleted, _ = TeamMembership.objects.filter(team_id=team_id, user_id=user_id).delete()
        if not deleted:
            return Response({"error": "Membership not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"status": "removed", "team_id": team_id, "user_id": user_id})


class TeamMemoryListView(APIView):
    """GET /api/teams/{id}/memories/ — list team memories. POST — create team memory."""

    def get(self, request, team_id):
        user, err = _get_user_or_401(request)
        if err:
            return err
        if not _is_team_member(team_id, str(user.id)):
            return Response({"error": "Not a team member"}, status=status.HTTP_403_FORBIDDEN)
        nodes = MemoryNode.objects.filter(team_id=team_id).order_by('-updated_at').values(
            'id', 'name', 'memory_type', 'relevance', 'created_at', 'updated_at'
        )[:100]
        return Response({"memories": list(nodes), "count": len(nodes)})

    def post(self, request, team_id):
        user, err = _get_user_or_401(request)
        if err:
            return err
        if not _is_team_admin(team_id, str(user.id)):
            return Response({"error": "Admin role required to create team memories"},
                            status=status.HTTP_403_FORBIDDEN)
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"error": "Field 'content' is required"}, status=status.HTTP_400_BAD_REQUEST)
        from .supermemory_adapter import supermemory_adapter
        result = supermemory_adapter.memorize(
            content=content,
            owner_id=str(user.id),
            metadata={**request.data.get("metadata", {}), "team_id": team_id},
            importance=float(request.data.get("importance", 0.5)),
        )
        # Attach team to all created nodes
        if result.get("doc_id"):
            MemoryNode.objects.filter(id=result["doc_id"]).update(team_id=team_id)
            for chunk_id in result.get("chunks", []):
                MemoryNode.objects.filter(id=chunk_id).update(team_id=team_id)
        result["team_id"] = team_id
        return Response(result, status=status.HTTP_201_CREATED)


class TeamMemoryDetailView(APIView):
    """DELETE /api/teams/{id}/memories/{memory_id} — delete team memory."""

    def delete(self, request, team_id, memory_id):
        user, err = _get_user_or_401(request)
        if err:
            return err
        if not _is_team_admin(team_id, str(user.id)):
            return Response({"error": "Admin role required"}, status=status.HTTP_403_FORBIDDEN)
        from .supermemory_adapter import supermemory_adapter
        result = supermemory_adapter.forget(memory_id=memory_id, owner_id=str(user.id), cascade=True)
        return Response(result, status=status.HTTP_200_OK)
