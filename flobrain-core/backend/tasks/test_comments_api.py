"""
Tests for the B6 Task Comments API:

- GET    /api/tasks/{task_id}/comments/
- POST   /api/tasks/{task_id}/comments/
- DELETE /api/tasks/{task_id}/comments/{comment_id}/
"""
import datetime

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from teams.models import Team, TeamMember
from users.jwt_utils import make_access_token, make_refresh_token
from users.models import User

from .models import Board, Task, TaskComment


def comments_url(task_id):
    return f"/api/tasks/{task_id}/comments/"


def comment_detail_url(task_id, comment_id):
    return f"/api/tasks/{task_id}/comments/{comment_id}/"


class CommentsApiTestBase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.owner = self.make_user("owner")
        self.assignee = self.make_user("assignee")
        self.stranger = self.make_user("stranger")

        self.lead = self.make_user("lead")
        self.member = self.make_user("member")
        self.intern = self.make_user("intern")

        # Personal board owned by `owner`; its task is assigned to `assignee`.
        self.personal_board = Board.objects.create(
            name="Personal Board",
            board_type=Board.BOARD_TYPE_PERSONAL,
            owner=self.owner,
        )
        self.personal_task = Task.objects.create(
            title="Personal task",
            board=self.personal_board,
            created_by=self.owner,
            assigned_to=self.assignee,
        )

        # Team board with a lead, a member and an intern.
        self.team = Team.objects.create(name="Alpha", created_by=self.lead)
        TeamMember.objects.create(team=self.team, user=self.lead, role="lead")
        TeamMember.objects.create(
            team=self.team, user=self.member, role="member"
        )
        TeamMember.objects.create(
            team=self.team, user=self.intern, role="intern"
        )
        self.team_board = Board.objects.create(
            name="Alpha Board",
            board_type=Board.BOARD_TYPE_TEAM,
            team=self.team,
        )
        self.team_task = Task.objects.create(
            title="Team task",
            board=self.team_board,
            created_by=self.lead,
        )

    @staticmethod
    def make_user(name):
        return User.objects.create(
            username=name,
            email=f"{name}@example.com",
            password_hash="not-used",
        )

    def auth(self, user):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {make_access_token(str(user.id))}"
        )

    def add_comment(self, task, author, body, created_at=None):
        comment = TaskComment.objects.create(task=task, author=author, body=body)
        if created_at is not None:
            # created_at uses auto_now_add, so set it with update().
            TaskComment.objects.filter(pk=comment.pk).update(
                created_at=created_at
            )
            comment.refresh_from_db()
        return comment


class AuthenticationTests(CommentsApiTestBase):
    def setUp(self):
        super().setUp()
        self.comment = self.add_comment(self.team_task, self.member, "Hi")

    def assert_all_endpoints_return_401(self):
        responses = [
            self.client.get(comments_url(self.team_task.id)),
            self.client.post(
                comments_url(self.team_task.id), {"body": "x"}, format="json"
            ),
            self.client.delete(
                comment_detail_url(self.team_task.id, self.comment.id)
            ),
        ]
        for response in responses:
            self.assertEqual(response.status_code, 401)
        self.assertTrue(TaskComment.objects.filter(pk=self.comment.pk).exists())
        self.assertEqual(TaskComment.objects.count(), 1)

    def test_missing_token_returns_401(self):
        self.assert_all_endpoints_return_401()

    def test_invalid_token_returns_401(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
        self.assert_all_endpoints_return_401()

    def test_non_bearer_scheme_returns_401(self):
        token = make_access_token(str(self.member.id))
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        self.assert_all_endpoints_return_401()

    def test_refresh_token_returns_401(self):
        token = make_refresh_token(str(self.member.id))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assert_all_endpoints_return_401()


class ListCommentsTests(CommentsApiTestBase):
    def test_member_gets_comments_oldest_first(self):
        now = timezone.now()
        # Inserted out of order on purpose.
        newest = self.add_comment(
            self.team_task, self.lead, "third", now
        )
        oldest = self.add_comment(
            self.team_task, self.member, "first",
            now - datetime.timedelta(hours=2),
        )
        middle = self.add_comment(
            self.team_task, self.intern, "second",
            now - datetime.timedelta(hours=1),
        )
        # Comment on another task -> must not appear.
        self.add_comment(self.personal_task, self.owner, "other task")

        self.auth(self.member)
        response = self.client.get(comments_url(self.team_task.id))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [c["id"] for c in response.data],
            [oldest.id, middle.id, newest.id],
        )
        self.assertEqual(
            [c["body"] for c in response.data], ["first", "second", "third"]
        )
        self.assertEqual(
            set(response.data[0].keys()),
            {"id", "author", "author_name", "body", "created_at"},
        )
        self.assertEqual(response.data[0]["author"], str(self.member.id))
        self.assertEqual(response.data[0]["author_name"], "member")

    def test_task_with_no_comments_returns_empty_list(self):
        self.auth(self.lead)
        response = self.client.get(comments_url(self.team_task.id))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_personal_board_owner_can_list(self):
        self.add_comment(self.personal_task, self.owner, "note")

        self.auth(self.owner)
        response = self.client.get(comments_url(self.personal_task.id))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_personal_task_assignee_can_list(self):
        self.add_comment(self.personal_task, self.owner, "note")

        self.auth(self.assignee)
        response = self.client.get(comments_url(self.personal_task.id))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_stranger_gets_403_on_personal_task(self):
        self.add_comment(self.personal_task, self.owner, "private")

        self.auth(self.stranger)
        response = self.client.get(comments_url(self.personal_task.id))

        self.assertEqual(response.status_code, 403)
        self.assertNotIn("private", str(response.data))

    def test_non_member_gets_403_on_team_task(self):
        self.add_comment(self.team_task, self.member, "team only")

        self.auth(self.stranger)
        response = self.client.get(comments_url(self.team_task.id))

        self.assertEqual(response.status_code, 403)
        self.assertNotIn("team only", str(response.data))

    def test_former_member_gets_403(self):
        TeamMember.objects.filter(team=self.team, user=self.member).delete()

        self.auth(self.member)
        response = self.client.get(comments_url(self.team_task.id))

        self.assertEqual(response.status_code, 403)

    def test_missing_task_returns_404(self):
        self.auth(self.member)
        response = self.client.get(comments_url(999999))

        self.assertEqual(response.status_code, 404)


class CreateCommentTests(CommentsApiTestBase):
    def test_member_can_create_comment(self):
        self.auth(self.member)
        response = self.client.post(
            comments_url(self.team_task.id),
            {"body": "Looks good"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["body"], "Looks good")
        self.assertEqual(response.data["author"], str(self.member.id))
        self.assertEqual(response.data["author_name"], "member")
        self.assertIn("id", response.data)
        self.assertIn("created_at", response.data)

        comment = TaskComment.objects.get(pk=response.data["id"])
        self.assertEqual(comment.task, self.team_task)
        self.assertEqual(comment.author, self.member)

    def test_intern_can_create_comment(self):
        self.auth(self.intern)
        response = self.client.post(
            comments_url(self.team_task.id), {"body": "Question"}, format="json"
        )
        self.assertEqual(response.status_code, 201)

    def test_author_comes_from_token_not_request_body(self):
        self.auth(self.member)
        response = self.client.post(
            comments_url(self.team_task.id),
            {
                "body": "Spoof attempt",
                "author": str(self.lead.id),
                "author_id": str(self.lead.id),
                "task": self.personal_task.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        comment = TaskComment.objects.get(pk=response.data["id"])
        self.assertEqual(comment.author, self.member)
        self.assertEqual(comment.task, self.team_task)

    def test_personal_owner_and_assignee_can_create(self):
        for user in (self.owner, self.assignee):
            self.auth(user)
            response = self.client.post(
                comments_url(self.personal_task.id),
                {"body": f"from {user.username}"},
                format="json",
            )
            self.assertEqual(response.status_code, 201)

        self.assertEqual(
            TaskComment.objects.filter(task=self.personal_task).count(), 2
        )

    def test_missing_body_returns_400(self):
        self.auth(self.member)
        response = self.client.post(
            comments_url(self.team_task.id), {}, format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("body", response.data)
        self.assertEqual(TaskComment.objects.count(), 0)

    def test_blank_body_returns_400(self):
        self.auth(self.member)
        for body in ("", "   ", "\n\t"):
            response = self.client.post(
                comments_url(self.team_task.id), {"body": body}, format="json"
            )
            self.assertEqual(response.status_code, 400, repr(body))
            self.assertIn("body", response.data)

        self.assertEqual(TaskComment.objects.count(), 0)

    def test_null_body_returns_400(self):
        self.auth(self.member)
        response = self.client.post(
            comments_url(self.team_task.id), {"body": None}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_non_member_gets_403(self):
        self.auth(self.stranger)
        response = self.client.post(
            comments_url(self.team_task.id), {"body": "Let me in"}, format="json"
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(TaskComment.objects.count(), 0)

    def test_stranger_gets_403_on_personal_task(self):
        self.auth(self.stranger)
        response = self.client.post(
            comments_url(self.personal_task.id), {"body": "Hi"}, format="json"
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(TaskComment.objects.count(), 0)

    def test_missing_task_returns_404(self):
        self.auth(self.member)
        response = self.client.post(
            comments_url(999999), {"body": "Hello"}, format="json"
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(TaskComment.objects.count(), 0)


class DeleteCommentTests(CommentsApiTestBase):
    def setUp(self):
        super().setUp()
        self.comment = self.add_comment(self.team_task, self.member, "Mine")

    def test_author_can_delete_comment(self):
        self.auth(self.member)
        response = self.client.delete(
            comment_detail_url(self.team_task.id, self.comment.id)
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")
        self.assertFalse(TaskComment.objects.filter(pk=self.comment.pk).exists())

    def test_other_member_cannot_delete_comment(self):
        self.auth(self.intern)
        response = self.client.delete(
            comment_detail_url(self.team_task.id, self.comment.id)
        )

        self.assertEqual(response.status_code, 403)
        self.assertTrue(TaskComment.objects.filter(pk=self.comment.pk).exists())

    def test_team_lead_cannot_delete_someone_elses_comment(self):
        self.auth(self.lead)
        response = self.client.delete(
            comment_detail_url(self.team_task.id, self.comment.id)
        )

        self.assertEqual(response.status_code, 403)
        self.assertTrue(TaskComment.objects.filter(pk=self.comment.pk).exists())

    def test_non_member_gets_403(self):
        self.auth(self.stranger)
        response = self.client.delete(
            comment_detail_url(self.team_task.id, self.comment.id)
        )

        self.assertEqual(response.status_code, 403)
        self.assertTrue(TaskComment.objects.filter(pk=self.comment.pk).exists())

    def test_author_who_left_team_gets_403(self):
        TeamMember.objects.filter(team=self.team, user=self.member).delete()

        self.auth(self.member)
        response = self.client.delete(
            comment_detail_url(self.team_task.id, self.comment.id)
        )

        self.assertEqual(response.status_code, 403)
        self.assertTrue(TaskComment.objects.filter(pk=self.comment.pk).exists())

    def test_personal_board_author_can_delete_and_stranger_cannot(self):
        comment = self.add_comment(self.personal_task, self.assignee, "Done?")

        self.auth(self.stranger)
        response = self.client.delete(
            comment_detail_url(self.personal_task.id, comment.id)
        )
        self.assertEqual(response.status_code, 403)

        self.auth(self.owner)
        response = self.client.delete(
            comment_detail_url(self.personal_task.id, comment.id)
        )
        self.assertEqual(response.status_code, 403)

        self.auth(self.assignee)
        response = self.client.delete(
            comment_detail_url(self.personal_task.id, comment.id)
        )
        self.assertEqual(response.status_code, 204)
        self.assertFalse(TaskComment.objects.filter(pk=comment.pk).exists())

    def test_missing_comment_returns_404(self):
        self.auth(self.member)
        response = self.client.delete(
            comment_detail_url(self.team_task.id, 999999)
        )
        self.assertEqual(response.status_code, 404)

    def test_comment_from_another_task_returns_404(self):
        other_task = Task.objects.create(
            title="Other team task",
            board=self.team_board,
            created_by=self.lead,
        )

        self.auth(self.member)
        response = self.client.delete(
            comment_detail_url(other_task.id, self.comment.id)
        )

        self.assertEqual(response.status_code, 404)
        self.assertTrue(TaskComment.objects.filter(pk=self.comment.pk).exists())

    def test_missing_task_returns_404(self):
        self.auth(self.member)
        response = self.client.delete(
            comment_detail_url(999999, self.comment.id)
        )

        self.assertEqual(response.status_code, 404)
        self.assertTrue(TaskComment.objects.filter(pk=self.comment.pk).exists())

    def test_get_on_detail_url_not_allowed(self):
        self.auth(self.member)
        response = self.client.get(
            comment_detail_url(self.team_task.id, self.comment.id)
        )
        self.assertEqual(response.status_code, 405)


class B4StillWorksTests(CommentsApiTestBase):
    """Adding B6 must not change B4 behaviour (full B4 suite is in
    test_assignment_api.py; this is a quick smoke check alongside comments)."""

    def test_lead_can_assign_task_that_has_comments(self):
        self.add_comment(self.team_task, self.member, "Can I take this?")

        self.auth(self.lead)
        response = self.client.post(
            f"/api/tasks/{self.team_task.id}/assign/",
            {"user_id": str(self.member.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_to"]["id"], str(self.member.id))
        self.assertEqual(TaskComment.objects.filter(task=self.team_task).count(), 1)

    def test_b4_still_hides_inaccessible_tasks_with_404(self):
        self.auth(self.stranger)
        response = self.client.post(
            f"/api/tasks/{self.team_task.id}/assign/",
            {"user_id": str(self.member.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 404)
