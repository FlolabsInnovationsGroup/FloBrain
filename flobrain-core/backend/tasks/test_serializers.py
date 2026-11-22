from datetime import date

from django.db.models import Count
from django.test import TestCase

from tasks.models import Board, Task, TaskComment
from tasks.serializers import (
    BoardSerializer,
    TaskCommentSerializer,
    TaskCreateSerializer,
    TaskDetailSerializer,
    TaskListSerializer,
    TaskUpdateSerializer,
)
from teams.models import Team, TeamMember
from users.models import User


class TaskSerializerTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create(
            username="owner",
            email="owner@example.com",
            password_hash="unused",
        )
        self.member = User.objects.create(
            username="member",
            email="member@example.com",
            password_hash="unused",
        )
        self.outsider = User.objects.create(
            username="outsider",
            email="outsider@example.com",
            password_hash="unused",
        )
        self.personal_assignee = User.objects.create(
            username="personal-assignee",
            email="personal@example.com",
            password_hash="unused",
        )

        self.team = Team.objects.create(
            name="Platform",
            created_by=self.owner,
        )
        TeamMember.objects.create(
            team=self.team,
            user=self.owner,
            role="lead",
        )
        TeamMember.objects.create(
            team=self.team,
            user=self.member,
            role="member",
        )

        self.personal_board = Board.objects.create(
            name="Personal Board",
            board_type=Board.BOARD_TYPE_PERSONAL,
            owner=self.owner,
        )
        self.team_board = Board.objects.create(
            name="Platform Board",
            board_type=Board.BOARD_TYPE_TEAM,
            team=self.team,
        )

        self.due_date = date(2026, 12, 1)
        self.assigned_task = Task.objects.create(
            title="Ship serializers",
            description="Cover list and detail output",
            status=Task.STATUS_IN_PROGRESS,
            priority=Task.PRIORITY_HIGH,
            board=self.team_board,
            created_by=self.owner,
            assigned_to=self.member,
            due_date=self.due_date,
        )
        self.unassigned_task = Task.objects.create(
            title="Unassigned task",
            board=self.personal_board,
            created_by=self.owner,
        )
        self.comment = TaskComment.objects.create(
            task=self.assigned_task,
            author=self.owner,
            body="Looks good",
        )

    def test_task_list_serializer_returns_expected_fields(self):
        data = TaskListSerializer(self.assigned_task).data

        self.assertEqual(
            set(data.keys()),
            {"id", "title", "status", "priority", "assigned_to", "due_date"},
        )
        self.assertEqual(data["title"], "Ship serializers")
        self.assertEqual(data["status"], Task.STATUS_IN_PROGRESS)
        self.assertEqual(data["priority"], Task.PRIORITY_HIGH)
        self.assertEqual(data["due_date"], "2026-12-01")

    def test_assigned_to_returns_id_and_name(self):
        data = TaskListSerializer(self.assigned_task).data

        self.assertEqual(
            data["assigned_to"],
            {
                "id": str(self.member.id),
                "name": "member",
            },
        )

    def test_assigned_to_is_null_when_unassigned(self):
        data = TaskListSerializer(self.unassigned_task).data

        self.assertIsNone(data["assigned_to"])

    def test_task_detail_serializer_includes_model_fields_and_comments(self):
        data = TaskDetailSerializer(self.assigned_task).data
        model_field_names = [field.name for field in Task._meta.fields]

        for field_name in model_field_names:
            self.assertIn(field_name, data)

        self.assertEqual(data["title"], "Ship serializers")
        self.assertEqual(data["description"], "Cover list and detail output")
        self.assertEqual(data["board"], self.team_board.id)
        self.assertEqual(data["created_by"], self.owner.id)
        self.assertEqual(data["assigned_to"], self.member.id)
        self.assertEqual(len(data["comments"]), 1)
        self.assertEqual(data["comments"][0]["body"], "Looks good")
        self.assertEqual(data["comments"][0]["author_name"], "owner")
        self.assertIn("created_at", data["comments"][0])

    def test_task_create_serializer_accepts_valid_data(self):
        serializer = TaskCreateSerializer(
            data={
                "title": "  Write tests  ",
                "description": "Serializer coverage",
                "priority": Task.PRIORITY_URGENT,
                "due_date": "2026-12-15",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["title"], "Write tests")
        self.assertEqual(
            serializer.validated_data["description"],
            "Serializer coverage",
        )
        self.assertEqual(
            serializer.validated_data["priority"],
            Task.PRIORITY_URGENT,
        )
        self.assertEqual(
            serializer.validated_data["due_date"],
            date(2026, 12, 15),
        )
        for field_name in ("title", "description", "priority", "due_date"):
            self.assertTrue(serializer.fields[field_name].write_only)

        task = serializer.save(
            board=self.personal_board,
            created_by=self.owner,
        )
        self.assertEqual(task.title, "Write tests")
        self.assertEqual(task.board_id, self.personal_board.id)
        self.assertEqual(task.created_by_id, self.owner.id)
        self.assertNotIn("board", serializer.validated_data)
        self.assertNotIn("created_by", serializer.validated_data)

    def test_task_create_serializer_rejects_empty_title(self):
        serializer = TaskCreateSerializer(data={"title": ""})

        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_task_create_serializer_rejects_whitespace_title(self):
        serializer = TaskCreateSerializer(data={"title": " \n\t "})

        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_task_create_serializer_rejects_board_and_created_by(self):
        serializer = TaskCreateSerializer(
            data={
                "title": "Client supplied ownership",
                "board": self.team_board.id,
                "created_by": str(self.outsider.id),
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("board", serializer.errors)
        self.assertIn("created_by", serializer.errors)
        self.assertNotIn("board", serializer.fields)
        self.assertNotIn("created_by", serializer.fields)

    def test_task_update_serializer_supports_partial_updates(self):
        serializer = TaskUpdateSerializer(
            self.assigned_task,
            data={"title": "Updated title"},
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.assigned_task.refresh_from_db()

        self.assertEqual(self.assigned_task.title, "Updated title")
        self.assertEqual(self.assigned_task.status, Task.STATUS_IN_PROGRESS)
        self.assertEqual(self.assigned_task.priority, Task.PRIORITY_HIGH)
        self.assertEqual(self.assigned_task.assigned_to_id, self.member.id)

    def test_task_update_serializer_rejects_non_member_on_team_board(self):
        serializer = TaskUpdateSerializer(
            self.assigned_task,
            data={"assigned_to": str(self.outsider.id)},
            partial=True,
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("assigned_to", serializer.errors)
        self.assertIn(
            "not a member of this team",
            str(serializer.errors["assigned_to"]),
        )
        self.assigned_task.refresh_from_db()
        self.assertEqual(self.assigned_task.assigned_to_id, self.member.id)

    def test_task_update_serializer_accepts_team_member(self):
        serializer = TaskUpdateSerializer(
            self.assigned_task,
            data={"assigned_to": str(self.owner.id)},
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.assigned_task.refresh_from_db()
        self.assertEqual(self.assigned_task.assigned_to_id, self.owner.id)

    def test_task_update_serializer_accepts_any_user_on_personal_board(self):
        serializer = TaskUpdateSerializer(
            self.unassigned_task,
            data={"assigned_to": str(self.personal_assignee.id)},
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.unassigned_task.refresh_from_db()
        self.assertEqual(
            self.unassigned_task.assigned_to_id,
            self.personal_assignee.id,
        )

    def test_task_update_serializer_uses_board_from_context(self):
        serializer = TaskUpdateSerializer(
            data={"assigned_to": str(self.outsider.id)},
            context={"board": self.team_board},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("assigned_to", serializer.errors)

    def test_board_serializer_returns_task_count(self):
        data = BoardSerializer(self.team_board).data

        self.assertEqual(
            set(data.keys()),
            {"id", "name", "board_type", "task_count"},
        )
        self.assertEqual(data["name"], "Platform Board")
        self.assertEqual(data["board_type"], Board.BOARD_TYPE_TEAM)
        self.assertEqual(data["task_count"], 1)

        annotated = Board.objects.annotate(task_count=Count("tasks")).get(
            pk=self.personal_board.pk
        )
        annotated_data = BoardSerializer(annotated).data
        self.assertEqual(annotated_data["task_count"], 1)

        empty_board = Board.objects.create(
            name="Empty",
            board_type=Board.BOARD_TYPE_PERSONAL,
            owner=self.member,
        )
        self.assertEqual(BoardSerializer(empty_board).data["task_count"], 0)

    def test_task_comment_serializer_returns_author_name(self):
        data = TaskCommentSerializer(self.comment).data

        self.assertEqual(
            set(data.keys()),
            {"id", "author_name", "body", "created_at"},
        )
        self.assertEqual(data["author_name"], "owner")
        self.assertEqual(data["body"], "Looks good")
        self.assertIn("created_at", data)
