from django.db import models


class Document(models.Model):
    title = models.CharField(max_length=255, default="Untitled Document")
    content = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="documents",
    )
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "documents"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class DocumentAttachment(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to="attachments/%Y/%m/")
    uploaded_by = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "document_attachments"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
