# Create your tests here.

from urllib import response

from django.test import TestCase
from rest_framework.test import APIClient

from users.jwt_utils import make_access_token
from users.models import User

from .models import ChatRoom, ChatRoomMember, Message


class ChatRoomAPITestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create(
            username="Alice",
            email="alice@example.test",
            password_hash="unused",
        )

        self.other_user = User.objects.create(
            username="Bob",
            email="bob@example.test",
            password_hash="unused",
        )

        token = make_access_token(str(self.user.id))
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )

    def test_create_chat_room(self):
        response = self.client.post(
            "/api/chat/rooms/",
            {"title": "Development Team"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        room = ChatRoom.objects.get(title="Development Team")

        self.assertTrue(
            ChatRoomMember.objects.filter(
                room=room,
                user=self.user,
                role=ChatRoomMember.ROLE_ADMIN,
            ).exists()
        )

    def test_list_chat_rooms(self):
        room = ChatRoom.objects.create(
            title="My Room",
            created_by=self.user,
        )

        ChatRoomMember.objects.create(
            room=room,
            user=self.user,
            role=ChatRoomMember.ROLE_ADMIN,
        )

        response = self.client.get("/api/chat/rooms/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_user_cannot_access_another_users_room(self):
        room = ChatRoom.objects.create(
            title="Private Room",
            created_by=self.other_user,
        )

        ChatRoomMember.objects.create(
            room=room,
            user=self.other_user,
        )

        response = self.client.get(
            f"/api/chat/rooms/{room.id}/"
        )

        self.assertEqual(response.status_code, 404)

    def test_get_room_messages(self):
        room = ChatRoom.objects.create(
            title="Message Room",
            created_by=self.user,
        )

        ChatRoomMember.objects.create(
            room=room,
            user=self.user,
            role=ChatRoomMember.ROLE_ADMIN,
        )

        Message.objects.create(
            room=room,
            sender=self.user,
            content="Hello everyone!",
        )

        response = self.client.get(
            f"/api/chat/rooms/{room.id}/messages/"
        )
        

        self.assertEqual(
            response.status_code,
            200,
            response.content.decode(),
        )
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["content"],
            "Hello everyone!",
        )

    def test_unauthenticated_user_cannot_list_rooms(self):
        self.client.credentials()

        response = self.client.get("/api/chat/rooms/")

        self.assertEqual(response.status_code, 401)