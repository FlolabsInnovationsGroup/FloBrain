
from django.db import models
from django.utils import timezone


class Team(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    ROLE_LEAD = "lead"
    ROLE_MEMBER = "member"
    ROLE_INTERN = "intern"

    ROLE_CHOICES = [
        (ROLE_LEAD, "Lead"),
        (ROLE_MEMBER, "Member"),
        (ROLE_INTERN, "Intern"),
    ]

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="members",
    )

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="team_memberships",
    )

    role = models.CharField(
        max_length=16,
        choices=ROLE_CHOICES,
        default=ROLE_MEMBER,
    )

    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "team_members"
        unique_together = [["team", "user"]]
        ordering = ["joined_at"]

    def __str__(self):
        return f"{self.user} — {self.team} ({self.role})"
