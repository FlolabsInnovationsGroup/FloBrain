from django.db import models


class CalendarEvent(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    owner = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="calendar_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "calendar_events"
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.title} ({self.date})"


class Todo(models.Model):
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    owner = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="todos",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "todos"
        ordering = ["completed", "-created_at"]

    def __str__(self):
        return self.title
