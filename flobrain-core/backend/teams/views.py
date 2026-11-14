import uuid

from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Team, TeamMember
from .serializers import (
    TeamListSerializer,
    TeamDetailSerializer,
    TeamCreateSerializer,
    TeamAddMemberSerializer,
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
        # Authenticate the user
        user = get_user_from_request(request)

        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check that the user belongs to the requested team
        team = Team.objects.filter(
            id=team_id,
            members__user=user
        ).distinct().first()

        # Return 404 if the team doesn't exist or user isn't a member
        if not team:
            return Response(
                {"error": "Team not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Serialize and return full team details
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

        # Reject an existing membership before creating another one.
        # Invalid UUIDs fall through to the serializer.
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
