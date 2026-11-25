
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase

from flobrain.asgi import application
from users.jwt_utils import make_access_token
from users.models import User

from .models import ChatRoom, ChatRoomMember, Message


class ChatRoomWebSocketTests(TransactionTestCase):

    def setUp(self):
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

        self.outsider = User.objects.create(
            username="Charlie",
            email="charlie@example.test",
            password_hash="unused",
        )

        self.room = ChatRoom.objects.create(
            title="WebSocket Test Room",
            created_by=self.user,
        )

        ChatRoomMember.objects.create(
            room=self.room,
            user=self.user,
            role=ChatRoomMember.ROLE_ADMIN,
        )

        ChatRoomMember.objects.create(
            room=self.room,
            user=self.other_user,
            role=ChatRoomMember.ROLE_MEMBER,
        )

        self.user_token = make_access_token(str(self.user.id))
        self.other_user_token = make_access_token(str(self.other_user.id))
        self.outsider_token = make_access_token(str(self.outsider.id))

        self.websocket_path = f"/ws/chat/{self.room.id}/"

        # Explicit headers for AllowedHostsOriginValidator.
        self.headers = [
            (b"host", b"localhost"),
            (b"origin", b"http://localhost"),
        ]

    def create_communicator(self, token=None):
        path = self.websocket_path

        if token:
            path += f"?token={token}"

        return WebsocketCommunicator(
            application,
            path,
            headers=self.headers,
        )

    def test_authenticated_member_can_connect(self):
        async_to_sync(self._test_authenticated_connection)()

    async def _test_authenticated_connection(self):
        communicator = self.create_communicator(self.user_token)

        connected, close_code = await communicator.connect()

        self.assertTrue(
            connected,
            f"Connection failed with close code: {close_code}",
        )

        await communicator.disconnect()

    def test_unauthenticated_user_is_rejected(self):
        async_to_sync(self._test_unauthenticated_connection)()

    async def _test_unauthenticated_connection(self):
        communicator = self.create_communicator()

        connected, close_code = await communicator.connect()

        self.assertFalse(connected)
        self.assertEqual(close_code, 4401)

    def test_non_member_cannot_connect(self):
        async_to_sync(self._test_non_member_connection)()

    async def _test_non_member_connection(self):
        communicator = self.create_communicator(self.outsider_token)

        connected, close_code = await communicator.connect()

        self.assertFalse(connected)
        self.assertEqual(close_code, 4403)

    def test_message_is_broadcast_to_room_members(self):
        async_to_sync(self._test_message_broadcast)()

    async def _test_message_broadcast(self):
        alice = self.create_communicator(self.user_token)
        bob = self.create_communicator(self.other_user_token)

        alice_connected = False
        bob_connected = False

        try:
            alice_connected, alice_close_code = await alice.connect()
            self.assertTrue(
                alice_connected,
                f"Alice connection failed: {alice_close_code}",
            )

            bob_connected, bob_close_code = await bob.connect()
            self.assertTrue(
                bob_connected,
                f"Bob connection failed: {bob_close_code}",
            )

            await alice.send_json_to({
                "content": "Hello Bob!",
            })

            alice_message = await alice.receive_json_from(timeout=5)
            bob_message = await bob.receive_json_from(timeout=5)

            self.assertEqual(alice_message["content"], "Hello Bob!")
            self.assertEqual(bob_message["content"], "Hello Bob!")

            self.assertEqual(
                alice_message["sender_type"],
                Message.SENDER_USER,
            )

            self.assertTrue(
                await self.message_exists()
            )

        finally:
            if alice_connected:
                await alice.disconnect()

            if bob_connected:
                await bob.disconnect()

    @database_sync_to_async
    def message_exists(self):
        return Message.objects.filter(
            room=self.room,
            content="Hello Bob!",
            sender=self.user,
        ).exists()
