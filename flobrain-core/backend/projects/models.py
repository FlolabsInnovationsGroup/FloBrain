from django.db import models


class Project(models.Model):
    STATUS_ON_TRACK = "on_track"
    STATUS_AT_RISK = "at_risk"
    STATUS_COMPLETED = "completed"

    STATUS_CHOICES = [
        (STATUS_ON_TRACK, "On Track"),
        (STATUS_AT_RISK, "At Risk"),
        (STATUS_COMPLETED, "Completed"),
    ]

    name = models.CharField(max_length=255)
    team = models.ForeignKey(
        "teams.Team",
        on_delete=models.CASCADE,
        related_name="team_projects",
    )
    team_lead = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="led_projects",
    )
    progress = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ON_TRACK,
        db_index=True,
    )
    target_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
