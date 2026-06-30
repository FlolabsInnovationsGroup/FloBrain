from django.db import models

class ErrorLog(models.Model):
    LEVEL_CHOICES = [("warning", "warning"), ("error", "error"), ("critical", "critical")]
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    message = models.TextField()
    source = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]