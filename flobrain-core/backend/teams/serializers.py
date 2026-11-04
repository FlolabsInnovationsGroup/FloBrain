from rest_framework import serializers
from .models import Team, TeamMember
from users.models import User


class TeamMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = TeamMember
        fields = ["id", "user_id", "username", "email", "role", "joined_at"]
        read_only_fields = ["id", "joined_at"]


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    created_by_id = serializers.IntegerField(source="created_by.id", read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "description", "created_by_id", "created_at", "updated_at", "members"]
        read_only_fields = ["id", "created_at", "updated_at", "created_by_id"]