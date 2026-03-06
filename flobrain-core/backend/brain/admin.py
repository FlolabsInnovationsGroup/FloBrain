from django.contrib import admin
from .models import Chat, Message


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "created_at", "updated_at")
    list_filter = ("created_at",)
    search_fields = ("title",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "role", "text_preview", "created_at")

    def text_preview(self, obj):
        return (obj.text or "")[:50] + "..." if (obj.text and len(obj.text) > 50) else (obj.text or "")

    text_preview.short_description = "Text"
