from django.db import models


class AIModel(models.Model):
    """A model that is available to FloBrain's AI model pool."""

    PROVIDER_PRIVATE = "private"
    PROVIDER_OPEN_SOURCE = "open-source"
    PROVIDER_TYPE_CHOICES = [
        (PROVIDER_PRIVATE, "Private"),
        (PROVIDER_OPEN_SOURCE, "Open source"),
    ]

    INPUT_TEXT = "text"
    INPUT_IMAGE = "image"
    INPUT_AUDIO = "audio"
    INPUT_VIDEO = "video"
    INPUT_DOCUMENT = "document"
    INPUT_MULTIMODAL = "multimodal"
    INPUT_TYPE_CHOICES = [
        (INPUT_TEXT, "Text"),
        (INPUT_IMAGE, "Image"),
        (INPUT_AUDIO, "Audio"),
        (INPUT_VIDEO, "Video"),
        (INPUT_DOCUMENT, "Document"),
        (INPUT_MULTIMODAL, "Multimodal"),
    ]

    name = models.CharField(max_length=200)
    provider_name = models.CharField(max_length=200)
    provider_type = models.CharField(
        max_length=16,
        choices=PROVIDER_TYPE_CHOICES,
        db_index=True,
    )
    supported_input_types = models.JSONField(default=list)
    capabilities = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ai_model_registry"
        ordering = ["provider_name", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["provider_name", "name"],
                name="unique_ai_model_per_provider",
            ),
        ]

    def __str__(self):
        return f"{self.provider_name}: {self.name}"
