from rest_framework import serializers
from django.db import transaction
from .models import Team, TeamMember
from users.models import User


class TeamMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    user_name = serializers.SerializerMethodField()

    def get_user_name(self, obj):
        full_name = getattr(obj.user, "full_name", None)
        return full_name or obj.user.email

    class Meta:
        model = TeamMember
        fields = ["id", "user_id", "user_name", "role", "joined_at"]
        read_only_fields = ["id", "user_id", "user_name", "role", "joined_at"]


class TeamListSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    def get_member_count(self, obj):
        return obj.members.count()

    class Meta:
        model = Team
        fields = ["id", "name", "member_count", "created_at"]
        read_only_fields = ["id", "name", "member_count", "created_at"]


class TeamCreatorSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return getattr(obj, "full_name", None) or obj.email

    class Meta:
        model = User
        fields = ["id", "name"]
        read_only_fields = ["id", "name"]


class TeamAddMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = TeamMember
        fields = ["user_id", "role"]
        extra_kwargs = {
            "role": {"default": "member"}
        }

    def validate_user_id(self, value):
        try:
            self.user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist.")

        return value

    def validate(self, attrs):
        team = self.context["team"]

        if TeamMember.objects.filter(
            team=team,
            user=self.user
        ).exists():
            raise serializers.ValidationError(
                "This user is already a member of this team."
            )

        return attrs

    def create(self, validated_data):
        team = self.context["team"]

        return TeamMember.objects.create(
            team=team,
            user=self.user,
            role=validated_data["role"]
        )

class TeamDetailSerializer(serializers.ModelSerializer):
    created_by = TeamCreatorSerializer(read_only=True)
    members = TeamMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "description",
            "created_by",
            "members",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class TeamCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Team
        fields = ["name", "description"]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["user"]

        team = Team.objects.create(
            created_by=user,
            **validated_data
        )

        TeamMember.objects.create(
            team=team,
            user=user,
            role="lead"
        )

        return team