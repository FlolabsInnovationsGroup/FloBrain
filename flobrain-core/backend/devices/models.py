from django.db import models

class Device(models.Model):
    device_id = models.CharField(max_length=255, unique=True)  # e.g. "XIAO-ESP32-S3"
    name = models.CharField(max_length=255, blank=True)
    last_seen = models.DateTimeField(auto_now=True)
    is_connected = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.device_id