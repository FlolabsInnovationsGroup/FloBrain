from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from teams.models import TeamMember
from users.views import get_user_from_request

from .models import Project
from .serializers import ProjectCreateSerializer, ProjectListSerializer, ProjectUpdateSerializer


def _accessible_projects(user):
    """Projects on teams the user is a member of."""
    team_ids = TeamMember.objects.filter(user=user).values_list("team_id", flat=True)
    return Project.objects.filter(team_id__in=team_ids).select_related("team", "team_lead")


def _is_team_lead(user, team):
    return TeamMember.objects.filter(team=team, user=user, role="lead").exists()


class ProjectListCreateView(APIView):
    """
    GET  /api/projects/  — list projects on teams the user belongs to
    POST /api/projects/  — create a project (team lead only)
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        projects = _accessible_projects(user)
        return Response(ProjectListSerializer(projects, many=True).data)

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = ProjectCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        team = serializer._team
        if not _is_team_lead(user, team):
            return Response(
                {"detail": "Only team leads can create projects."},
                status=status.HTTP_403_FORBIDDEN,
            )

        project = serializer.save(created_by=user)
        return Response(ProjectListSerializer(project).data, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    """
    GET    /api/projects/{id}/  — project detail
    PATCH  /api/projects/{id}/  — update (team lead only)
    DELETE /api/projects/{id}/  — delete (team lead only)
    """

    def get(self, request, project_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        project = get_object_or_404(_accessible_projects(user), id=project_id)
        return Response(ProjectListSerializer(project).data)

    def patch(self, request, project_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        project = get_object_or_404(_accessible_projects(user), id=project_id)
        if not _is_team_lead(user, project.team):
            return Response(
                {"detail": "Only team leads can update projects."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ProjectUpdateSerializer(project, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        project = serializer.save()
        return Response(ProjectListSerializer(project).data)

    def delete(self, request, project_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        project = get_object_or_404(_accessible_projects(user), id=project_id)
        if not _is_team_lead(user, project.team):
            return Response(
                {"detail": "Only team leads can delete projects."},
                status=status.HTTP_403_FORBIDDEN,
            )

        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
