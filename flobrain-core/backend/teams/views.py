from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Team, TeamMember
from .serializers import TeamSerializer, TeamMemberSerializer
from users.views import get_user_from_request
from users.models import User


class TeamListCreateView(APIView):

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        teams = Team.objects.filter(
            members__user=user
        ).distinct() | Team.objects.filter(created_by=user).distinct()
        serializer = TeamSerializer(teams.distinct(), many=True)
        return Response(serializer.data)

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = TeamSerializer(data=request.data)
        if serializer.is_valid():
            team = serializer.save(created_by=user)
            TeamMember.objects.create(team=team, user=user, role="lead")
            return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)
        return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class TeamDetailView(APIView):

    def get(self, request, team_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        team = get_object_or_404(Team, id=team_id)
        serializer = TeamSerializer(team)
        return Response(serializer.data)


class TeamMemberView(APIView):

    def post(self, request, team_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        team = get_object_or_404(Team, id=team_id)
        if not TeamMember.objects.filter(team=team, user=user, role="lead").exists():
            return Response({"error": "Only team leads can add members"}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get("user_id")
        role = request.data.get("role", "member")
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        new_user = get_object_or_404(User, id=user_id)
        if TeamMember.objects.filter(team=team, user=new_user).exists():
            return Response({"error": "User is already a member"}, status=status.HTTP_409_CONFLICT)
        member = TeamMember.objects.create(team=team, user=new_user, role=role)
        return Response(TeamMemberSerializer(member).data, status=status.HTTP_201_CREATED)

    def delete(self, request, team_id, user_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        team = get_object_or_404(Team, id=team_id)
        if not TeamMember.objects.filter(team=team, user=user, role="lead").exists():
            return Response({"error": "Only team leads can remove members"}, status=status.HTTP_403_FORBIDDEN)
        member = get_object_or_404(TeamMember, team=team, user__id=user_id)
        member.delete()
        return Response({"message": "Member removed successfully"}, status=status.HTTP_204_NO_CONTENT)