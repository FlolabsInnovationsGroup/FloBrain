from django.db import models
from django.utils import timezone
from users.models import User


class Team(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="led_teams",
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "teams"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    ROLE_CHOICES = [
        ("lead", "Lead"),
        ("member", "Member"),
        ("intern", "Intern"),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="team_memberships")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "team_members"
        unique_together = [["team", "user"]]

    def __str__(self):
        return f"{self.user} - {self.team} ({self.role})"


class TeamActivity(models.Model):
    EVENT_TYPES = [
        ("task_completed", "Task Completed"),
        ("member_joined", "Member Joined"),
        ("project_status_changed", "Project Status Changed"),
        ("document_uploaded", "Document Uploaded"),
    ]

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="activities",
    )

    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="team_activities",
    )

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_TYPES,
    )

    description = models.TextField()

    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "team_activities"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["team", "-created_at"]),
            models.Index(fields=["event_type"]),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.team.name}"

