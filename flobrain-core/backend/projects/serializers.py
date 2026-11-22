from rest_framework import serializers
from teams.models import TeamMember
from .models import Project


def _display_name(user):
    if user is None:
        return ""
    return user.username or user.email


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Read serializer for the /api/projects/ list and detail views.
    Matches the frontend Project interface:
      { id, name, teamLead, team, interns, progress, status, targetDate }
    """
    team = serializers.SerializerMethodField()
    team_lead = serializers.SerializerMethodField()
    interns = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    def get_team(self, obj):
        return obj.team.name

    def get_team_lead(self, obj):
        return _display_name(obj.team_lead)

    def get_interns(self, obj):
        return TeamMember.objects.filter(team=obj.team, role="intern").count()

    def get_status(self, obj):
        return dict(Project.STATUS_CHOICES).get(obj.status, obj.status)

    class Meta:
        model = Project
        fields = [
            "id", "name", "team", "team_lead",
            "interns", "progress", "status", "target_date",
        ]
        read_only_fields = fields


class TeamProjectSerializer(serializers.ModelSerializer):
    """
    Compact serializer used inside TeamDetailSerializer.projects[].
    Matches the frontend TeamProject interface:
      { id, name, activeTasks, closedTasks, activeInterns, progress }
    active_tasks and closed_tasks are placeholders until a Task→Project
    relationship is introduced.
    """
    active_tasks = serializers.SerializerMethodField()
    closed_tasks = serializers.SerializerMethodField()
    active_interns = serializers.SerializerMethodField()

    def get_active_tasks(self, obj):
        # Placeholder until Task gets a project FK
        return 0

    def get_closed_tasks(self, obj):
        # Placeholder until Task gets a project FK
        return 0

    def get_active_interns(self, obj):
        return TeamMember.objects.filter(team=obj.team, role="intern").count()

    class Meta:
        model = Project
        fields = [
            "id", "name", "active_tasks", "closed_tasks",
            "active_interns", "progress",
        ]
        read_only_fields = fields


class ProjectCreateSerializer(serializers.ModelSerializer):
    team_id = serializers.IntegerField(write_only=True)
    team_lead_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Project
        fields = [
            "name", "team_id", "team_lead_id",
            "progress", "status", "target_date",
        ]
        extra_kwargs = {
            "progress": {"required": False},
            "status": {"required": False},
            "target_date": {"required": False, "allow_null": True},
        }

    def validate_team_id(self, value):
        from teams.models import Team
        try:
            self._team = Team.objects.get(id=value)
        except Team.DoesNotExist:
            raise serializers.ValidationError("Team not found.")
        return value

    def validate_team_lead_id(self, value):
        if value is None:
            self._team_lead = None
            return value
        from users.models import User
        try:
            self._team_lead = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        return value

    def validate_progress(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Progress must be between 0 and 100.")
        return value

    def create(self, validated_data):
        validated_data.pop("team_id")
        validated_data.pop("team_lead_id", None)
        team_lead = getattr(self, "_team_lead", None)
        return Project.objects.create(
            team=self._team,
            team_lead=team_lead,
            **validated_data,
        )


class ProjectUpdateSerializer(serializers.ModelSerializer):
    team_lead_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Project
        fields = ["name", "team_lead_id", "progress", "status", "target_date"]
        extra_kwargs = {
            "name": {"required": False},
            "progress": {"required": False},
            "status": {"required": False},
            "target_date": {"required": False, "allow_null": True},
        }

    def validate_team_lead_id(self, value):
        if value is None:
            self._team_lead = None
            return value
        from users.models import User
        try:
            self._team_lead = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        return value

    def validate_progress(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Progress must be between 0 and 100.")
        return value

    def update(self, instance, validated_data):
        validated_data.pop("team_lead_id", None)
        if hasattr(self, "_team_lead"):
            instance.team_lead = self._team_lead
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
