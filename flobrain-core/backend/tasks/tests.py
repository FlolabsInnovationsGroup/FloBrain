from datetime import date, timedelta

from django.test import TestCase
from rest_framework.test import APIClient

from teams.models import Team, TeamMember
from users.jwt_utils import make_access_token
from users.models import User

from .models import Board, Task


class TaskAssignmentAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.creator = User.objects.create(email="creator@example.com", password_hash="test")
        self.other = User.objects.create(email="other@example.com", password_hash="test")
        self.member = User.objects.create(email="member@example.com", password_hash="test")
        self.outsider = User.objects.create(email="outsider@example.com", password_hash="test")

        self.personal_board = Board.objects.create(
            name="Personal", board_type=Board.BOARD_TYPE_PERSONAL, owner=self.creator
        )
        self.personal_task = Task.objects.create(
            title="Personal task", board=self.personal_board, created_by=self.creator
        )

        self.team = Team.objects.create(name="Flo Team", created_by=self.creator)
        TeamMember.objects.create(team=self.team, user=self.creator, role=TeamMember.ROLE_LEAD)
        TeamMember.objects.create(team=self.team, user=self.member, role=TeamMember.ROLE_MEMBER)
        self.team_board = Board.objects.create(
            name="Team board", board_type=Board.BOARD_TYPE_TEAM, team=self.team
        )
        self.team_task = Task.objects.create(
            title="Team task", board=self.team_board, created_by=self.creator
        )

    def authenticate(self, user):
        token = make_access_token(str(user.id))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_personal_creator_can_assign_and_unassign(self):
        self.authenticate(self.creator)
        response = self.client.post(
            f"/api/tasks/{self.personal_task.id}/assign/",
            {"user_id": str(self.creator.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_to"]["id"], str(self.creator.id))

        response = self.client.delete(f"/api/tasks/{self.personal_task.id}/assign/")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["assigned_to"])

    def test_personal_non_creator_cannot_assign(self):
        self.authenticate(self.other)
        response = self.client.post(
            f"/api/tasks/{self.personal_task.id}/assign/",
            {"user_id": str(self.other.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_team_lead_can_assign_member_but_not_outsider(self):
        self.authenticate(self.creator)
        response = self.client.post(
            f"/api/tasks/{self.team_task.id}/assign/",
            {"user_id": str(self.member.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_to"]["id"], str(self.member.id))

        response = self.client.post(
            f"/api/tasks/{self.team_task.id}/assign/",
            {"user_id": str(self.outsider.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_team_member_cannot_assign(self):
        self.authenticate(self.member)
        response = self.client.post(
            f"/api/tasks/{self.team_task.id}/assign/",
            {"user_id": str(self.member.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_assigned_to_me_includes_personal_and_team_and_orders_by_due_date(self):
        later = date.today() + timedelta(days=10)
        earlier = date.today() + timedelta(days=2)
        personal = Task.objects.create(
            title="Assigned personal",
            board=self.personal_board,
            created_by=self.creator,
            assigned_to=self.member,
            due_date=later,
        )
        team = Task.objects.create(
            title="Assigned team",
            board=self.team_board,
            created_by=self.creator,
            assigned_to=self.member,
            due_date=earlier,
        )

        self.authenticate(self.member)
        response = self.client.get("/api/tasks/assigned-to-me/")

        self.assertEqual(response.status_code, 200)
        ids = [str(item["id"]) for item in response.data]
        self.assertEqual(ids, [str(team.id), str(personal.id)])

    def test_created_by_me_returns_request_user_tasks(self):
        self.authenticate(self.creator)
        response = self.client.get("/api/tasks/created-by-me/")
        self.assertEqual(response.status_code, 200)
        ids = {str(item["id"]) for item in response.data}
        self.assertIn(str(self.personal_task.id), ids)
        self.assertIn(str(self.team_task.id), ids)

    def test_unknown_or_inaccessible_task_returns_404(self):
        self.authenticate(self.other)
        response = self.client.post(
            "/api/tasks/999999/assign/",
            {"user_id": str(self.other.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

        response = self.client.post(
            f"/api/tasks/{self.team_task.id}/assign/",
            {"user_id": str(self.other.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 404)
