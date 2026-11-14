
from django.test import TestCase

from users.models import User
from teams.models import Team, TeamMember
from .models import Board, Task, TaskComment
from .serializers import (
    TaskListSerializer,
    TaskDetailSerializer,
    TaskCreateSerializer,
    TaskUpdateSerializer,
    BoardSerializer,
    TaskCommentSerializer,
)


class TaskSerializerTests(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            email="user@example.com",
            password_hash="test-password-hash",
        )

        self.other_user = User.objects.create(
            email="other@example.com",
            password_hash="test-password-hash",
        )

        self.personal_board = Board.objects.create(
            name="Personal Board",
            board_type=Board.BOARD_TYPE_PERSONAL,
            owner=self.user,
        )

    def test_task_create_rejects_blank_title(self):
        serializer = TaskCreateSerializer(data={"title": "   "})
        self.assertFalse(serializer.is_valid())

    def test_task_create_does_not_accept_board_or_created_by(self):
        serializer = TaskCreateSerializer()
        self.assertNotIn("board", serializer.fields)
        self.assertNotIn("created_by", serializer.fields)

    def test_personal_board_allows_assigning_any_user(self):
        task = Task.objects.create(
            title="Test task",
            board=self.personal_board,
            created_by=self.user,
        )

        serializer = TaskUpdateSerializer(
            task,
            data={"assigned_to": self.other_user.id},
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_team_board_allows_assigning_team_member(self):
        team = Team.objects.create(
            name="Test Team",
            created_by=self.user,
        )

        TeamMember.objects.create(
            team=team,
            user=self.user,
            role="member",
        )

        board = Board.objects.create(
            name="Team Board",
            board_type=Board.BOARD_TYPE_TEAM,
            team=team,
        )

        task = Task.objects.create(
            title="Team task",
            board=board,
            created_by=self.user,
        )

        serializer = TaskUpdateSerializer(
            task,
            data={"assigned_to": self.user.id},
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_team_board_rejects_non_member_assignment(self):
        team = Team.objects.create(
            name="Test Team",
            created_by=self.user,
        )

        board = Board.objects.create(
            name="Team Board",
            board_type=Board.BOARD_TYPE_TEAM,
            team=team,
        )

        task = Task.objects.create(
            title="Team task",
            board=board,
            created_by=self.user,
        )

        serializer = TaskUpdateSerializer(
            task,
            data={"assigned_to": self.other_user.id},
            partial=True,
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("assigned_to", serializer.errors)

    def test_task_list_serializer_has_expected_fields(self):
        serializer = TaskListSerializer()

        self.assertEqual(
            set(serializer.fields.keys()),
            {
                "id",
                "title",
                "status",
                "priority",
                "assigned_to",
                "due_date",
            },
        )

    def test_task_detail_includes_comments(self):
        task = Task.objects.create(
            title="Test task",
            board=self.personal_board,
            created_by=self.user,
        )

        TaskComment.objects.create(
            task=task,
            author=self.user,
            body="This is a test comment.",
        )

        serializer = TaskDetailSerializer(task)
        comments = serializer.data["comments"]

        self.assertEqual(len(comments), 1)
        self.assertEqual(
            comments[0]["body"],
            "This is a test comment.",
        )
        self.assertEqual(
            comments[0]["author_name"],
            self.user.email,
        )

    def test_board_serializer_has_task_count(self):
        Task.objects.create(
            title="Task 1",
            board=self.personal_board,
            created_by=self.user,
        )

        Task.objects.create(
            title="Task 2",
            board=self.personal_board,
            created_by=self.user,
        )

        serializer = BoardSerializer(self.personal_board)

        self.assertEqual(serializer.data["task_count"], 2)

    def test_comment_serializer_has_expected_fields(self):
        serializer = TaskCommentSerializer()

        self.assertEqual(
            set(serializer.fields.keys()),
            {"id", "author_name", "body", "created_at"},
        )
