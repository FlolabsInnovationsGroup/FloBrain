# Create your models here.
from django.db import models
from django.utils import timezone


class ChatRoom(models.Model):
    title = models.CharField(max_length=255, default="New Chat Room")

    created_by = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="created_chat_rooms",
    )

    members = models.ManyToManyField(
        "users.User",
        through="ChatRoomMember",
        related_name="chat_rooms",
        blank=True,
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chat_rooms"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class ChatRoomMember(models.Model):
    ROLE_ADMIN = "admin"
    ROLE_MEMBER = "member"

    ROLE_CHOICES = [
        (ROLE_ADMIN, "Admin"),
        (ROLE_MEMBER, "Member"),
    ]

    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="room_members",
    )

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="chat_room_memberships",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_MEMBER,
    )

    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "chat_room_members"
        unique_together = [["room", "user"]]

    def __str__(self):
        return f"{self.user} - {self.room}"


class Message(models.Model):
    SENDER_USER = "user"
    SENDER_BOT = "bot"

    SENDER_CHOICES = [
        (SENDER_USER, "User"),
        (SENDER_BOT, "Bot"),
    ]

    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="room_messages",
    )

    sender_type = models.CharField(
        max_length=10,
        choices=SENDER_CHOICES,
        default=SENDER_USER,
    )

    content = models.TextField()

    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "chat_room_messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender_type}: {self.content[:50]}"