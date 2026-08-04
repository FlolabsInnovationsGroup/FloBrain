from rest_framework import serializers

from .models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "role",
            "text",
            "image",
            "prompt_tokens",
            "completion_tokens",
            "timestamp",
        ]
        extra_kwargs = {"timestamp": {"source": "created_at", "read_only": True}}

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["id"] = f"msg-{instance.pk}"
        data["type"] = instance.role  # frontend expects "type" for user/assistant
        data["timestamp"] = (
            instance.created_at.isoformat() if instance.created_at else None
        )
        return data


class ChatUsageSerializer(serializers.Serializer):
    model = serializers.CharField()
    file_type = serializers.CharField(required=False)


class ChatListSerializer(serializers.ModelSerializer):
    """Minimal payload for list view."""

    messages = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "title", "timestamp", "messages"]

    def get_messages(self, obj):
        # Return only last few or empty for list; full messages loaded in detail
        return []


class ChatDetailSerializer(serializers.ModelSerializer):
    """Full chat with messages for get/send."""

    messages = MessageSerializer(many=True, read_only=True)
    timestamp = serializers.DateTimeField(source="updated_at", read_only=True)
    usage = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ["id", "title", "timestamp", "messages", "usage"]

    def get_usage(self, obj):
        usage = self.context.get("usage")
        if not usage:
            return None
        return usage


class ChatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ["title"]

    def create(self, validated_data):
        user = self.context.get("user")
        if not user:
            raise serializers.ValidationError("Authentication required")
        return Chat.objects.create(user=user, **validated_data)


class ChatUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ["title"]


class SendMessageSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=True)
    image = serializers.CharField(allow_blank=True, required=False)
    model = serializers.CharField(required=False, allow_blank=True)
