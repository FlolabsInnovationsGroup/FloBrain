
from django.test import TestCase
from rest_framework.test import APIClient

from users.models import User
from users.jwt_utils import make_access_token
from teams.models import Team, TeamMember
from tasks.models import Board, Task


class TeamBoardAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.lead = User.objects.create(
            username="teamlead",
            email="lead@example.com",
            password_hash="unused",
        )

        self.member = User.objects.create(
            username="teammember",
            email="member@example.com",
            password_hash="unused",
        )

        self.non_member = User.objects.create(
            username="outsider",
            email="outsider@example.com",
            password_hash="unused",
        )

        self.team = Team.objects.create(
            name="Test Team",
            created_by=self.lead,
        )

        TeamMember.objects.create(
            team=self.team,
            user=self.lead,
            role="lead",
        )

        TeamMember.objects.create(
            team=self.team,
            user=self.member,
            role="member",
        )

    def authenticate(self, user):
        token = make_access_token(str(user.id))
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )

    def test_team_board_auto_creates_for_member(self):
        self.authenticate(self.member)

        response = self.client.get(
            f"/api/tasks/teams/{self.team.id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Board.objects.filter(
                team=self.team,
                board_type=Board.BOARD_TYPE_TEAM,
            ).exists()
        )

    def test_non_member_cannot_access_team_board(self):
        self.authenticate(self.non_member)

        response = self.client.get(
            f"/api/tasks/teams/{self.team.id}/"
        )

        self.assertEqual(response.status_code, 403)

    def test_unknown_team_returns_404(self):
        self.authenticate(self.member)

        response = self.client.get(
            "/api/tasks/teams/999999/"
        )

        self.assertEqual(response.status_code, 404)

    def test_member_can_create_team_task(self):
        self.authenticate(self.member)

        response = self.client.post(
            f"/api/tasks/teams/{self.team.id}/tasks/",
            {
                "title": "Test team task",
                "description": "Testing B3",
                "status": "todo",
                "priority": "medium",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_non_member_cannot_create_team_task(self):
        self.authenticate(self.non_member)

        response = self.client.post(
            f"/api/tasks/teams/{self.team.id}/tasks/",
            {
                "title": "Unauthorized task",
                "status": "todo",
                "priority": "medium",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_member_cannot_delete_team_task(self):
        board = Board.objects.create(
            team=self.team,
            board_type=Board.BOARD_TYPE_TEAM,
            name="Test Team Board",
        )

        task = Task.objects.create(
            board=board,
            created_by=self.lead,
            title="Task to protect",
            status="todo",
            priority="medium",
        )

        self.authenticate(self.member)

        response = self.client.delete(
            f"/api/tasks/teams/{self.team.id}/tasks/{task.id}/"
        )

        self.assertEqual(response.status_code, 403)

    def test_lead_can_delete_team_task(self):
        board = Board.objects.create(
            team=self.team,
            board_type=Board.BOARD_TYPE_TEAM,
            name="Test Team Board",
        )

        task = Task.objects.create(
            board=board,
            created_by=self.lead,
            title="Task to delete",
            status="todo",
            priority="medium",
        )

        self.authenticate(self.lead)

        response = self.client.delete(
            f"/api/tasks/teams/{self.team.id}/tasks/{task.id}/"
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Task.objects.filter(id=task.id).exists())


    def test_member_cannot_update_team_task_if_not_member(self):
        board = Board.objects.create(
            team=self.team,
            board_type=Board.BOARD_TYPE_TEAM,
            name="Test Team Board",
        )

        task = Task.objects.create(
            board=board,
            created_by=self.lead,
            title="Protected task",
            status="todo",
            priority="medium",
        )

        self.authenticate(self.non_member)

        response = self.client.patch(
            f"/api/tasks/teams/{self.team.id}/tasks/{task.id}/",
            {"title": "Unauthorized update"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_member_can_update_team_task(self):
        board = Board.objects.create(
            team=self.team,
            board_type=Board.BOARD_TYPE_TEAM,
            name="Test Team Board",
        )

        task = Task.objects.create(
            board=board,
            created_by=self.lead,
            title="Original title",
            status="todo",
            priority="medium",
        )

        self.authenticate(self.member)

        response = self.client.patch(
            f"/api/tasks/teams/{self.team.id}/tasks/{task.id}/",
            {"title": "Updated title"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        task.refresh_from_db()
        self.assertEqual(task.title, "Updated title")

    def test_team_board_groups_tasks_by_status(self):
        board = Board.objects.create(
            team=self.team,
            board_type=Board.BOARD_TYPE_TEAM,
            name="Test Team Board",
        )

        Task.objects.create(
            board=board,
            created_by=self.lead,
            title="Backlog task",
            status="backlog",
            priority="medium",
        )

        Task.objects.create(
            board=board,
            created_by=self.lead,
            title="Completed task",
            status="done",
            priority="medium",
        )

        self.authenticate(self.member)

        response = self.client.get(
            f"/api/tasks/teams/{self.team.id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["tasks"]["backlog"]), 1)
        self.assertEqual(len(response.data["tasks"]["done"]), 1)

    def test_unauthenticated_user_cannot_access_team_board(self):
        response = self.client.get(
            f"/api/tasks/teams/{self.team.id}/"
        )

        self.assertEqual(response.status_code, 401)