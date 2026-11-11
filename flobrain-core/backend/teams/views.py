from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Team, TeamMember
from .serializers import (
    TeamListSerializer,
    TeamDetailSerializer,
    TeamCreateSerializer,
    TeamAddMemberSerializer,
    TeamMemberSerializer,
)
from users.views import get_user_from_request
from users.models import User


class TeamListCreateView(APIView):

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        # Teams where the user is a member OR the creator, without duplicates.
        teams = Team.objects.filter(
            Q(members__user=user) | Q(created_by=user)
        ).distinct()
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
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        team = get_object_or_404(Team, id=team_id)
        serializer = TeamDetailSerializer(team)
        return Response(serializer.data)


class TeamMemberView(APIView):

    def post(self, request, team_id):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        team = get_object_or_404(Team, id=team_id)

        if not TeamMember.objects.filter(
            team=team, user=user, role="lead"
        ).exists():
            return Response(
                {"error": "Only team leads can add members"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TeamAddMemberSerializer(
            data=request.data,
            context={"team": team}
        )

        if serializer.is_valid():
            member = serializer.save()
            return Response(
                TeamMemberSerializer(member).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"error": "Validation failed", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

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
