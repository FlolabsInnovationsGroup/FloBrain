from django.db import models
from django.utils import timezone


class Chat(models.Model):
    """A chat conversation belonging to a user."""

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="chats",
        db_column="user_id",
        to_field="id",
    )
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "brain_chats"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class Message(models.Model):
    """A single message in a chat (user or assistant)."""

    ROLE_USER = "user"
    ROLE_ASSISTANT = "assistant"
    ROLE_CHOICES = [(ROLE_USER, "User"), (ROLE_ASSISTANT, "Assistant")]

    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name="messages",
        db_column="chat_id",
    )
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, db_index=True)
    text = models.TextField(blank=True, null=True)
    image = models.TextField(blank=True, null=True)  # optional base64 or URL
    prompt_tokens = models.PositiveIntegerField(null=True, blank=True)
    completion_tokens = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "brain_messages"
        ordering = ["created_at"]

    def __str__(self):
        preview = (self.text or "")[:50]
        return f"{self.role}: {preview}..."
