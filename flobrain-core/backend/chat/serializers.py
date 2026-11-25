
from django.db import transaction
from rest_framework import serializers

from users.models import User
from .models import ChatRoom, ChatRoomMember, Message


class ChatRoomMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    user_name = serializers.SerializerMethodField()

    def get_user_name(self, obj):
        return getattr(obj.user, "full_name", None) or obj.user.email

    class Meta:
        model = ChatRoomMember
        fields = ["id", "user_id", "user_name", "role", "joined_at"]
        read_only_fields = fields


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.UUIDField(source="sender.id", read_only=True)
    sender_name = serializers.SerializerMethodField()

    def get_sender_name(self, obj):
        if obj.sender:
            return getattr(obj.sender, "full_name", None) or obj.sender.email
        return "FloBrain"

    class Meta:
        model = Message
        fields = [
            "id",
            "sender_id",
            "sender_name",
            "sender_type",
            "content",
            "created_at",
        ]
        read_only_fields = fields


class ChatRoomListSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    def get_member_count(self, obj):
        return obj.members.count()

    def get_last_message(self, obj):
        message = obj.messages.order_by("-created_at").first()
        if message:
            return MessageSerializer(message).data
        return None

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "title",
            "member_count",
            "last_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class ChatRoomDetailSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    members = ChatRoomMemberSerializer(
        source="room_members",
        many=True,
        read_only=True,
    )

    def get_created_by(self, obj):
        user = obj.created_by
        return {
            "id": str(user.id),
            "name": getattr(user, "full_name", None) or user.email,
        }

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "title",
            "created_by",
            "members",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class ChatRoomCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChatRoom
        fields = ["title"]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["user"]

        room = ChatRoom.objects.create(
            created_by=user,
            **validated_data,
        )

        ChatRoomMember.objects.create(
            room=room,
            user=user,
            role=ChatRoomMember.ROLE_ADMIN,
        )

        return room
