from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from docs.models import Document, DocumentAttachment
from projects.models import Project
from tasks.models import Board, Task
from teams.models import Team, TeamMember
from users.jwt_utils import make_access_token
from users.models import User


class LeadershipMetricsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(email="lead@example.com", password_hash="x")
        self.member = User.objects.create(email="member@example.com", password_hash="x")
        self.outsider = User.objects.create(email="outsider@example.com", password_hash="x")

        self.team = Team.objects.create(name="Platform", created_by=self.user)
        TeamMember.objects.create(team=self.team, user=self.user, role="lead")
        TeamMember.objects.create(team=self.team, user=self.member, role="member")

        self.foreign_team = Team.objects.create(name="Foreign", created_by=self.outsider)
        TeamMember.objects.create(team=self.foreign_team, user=self.outsider, role="lead")

        self.board = Board.objects.create(
            name="Platform Board",
            board_type=Board.BOARD_TYPE_TEAM,
            team=self.team,
        )
        self.token = make_access_token(str(self.user.id))

    def auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_scorecard_requires_authentication(self):
        response = self.client.get("/api/teams/scorecard/")
        self.assertEqual(response.status_code, 401)

    def test_scorecard_returns_team_metrics(self):
        now = timezone.now()
        Task.objects.create(
            title="On time",
            board=self.board,
            created_by=self.user,
            status=Task.STATUS_DONE,
            due_date=now.date(),
            completed_at=now,
            completed_by=self.member,
        )
        Task.objects.create(
            title="Late",
            board=self.board,
            created_by=self.user,
            status=Task.STATUS_DONE,
            due_date=(now - timezone.timedelta(days=5)).date(),
            completed_at=now,
        )
        Task.objects.create(
            title="Blocked",
            board=self.board,
            created_by=self.user,
            status=Task.STATUS_BLOCKED,
            due_date=(now + timezone.timedelta(days=2)).date(),
        )
        Task.objects.create(
            title="Open",
            board=self.board,
            created_by=self.member,
            status=Task.STATUS_IN_PROGRESS,
        )

        self.auth()
        response = self.client.get("/api/teams/scorecard/")

        self.assertEqual(response.status_code, 200)
        team_data = next(item for item in response.json() if item["team_id"] == self.team.id)
        self.assertEqual(team_data["task_completion_rate"], 50.0)
        self.assertEqual(team_data["on_time_delivery_percentage"], 50.0)
        self.assertEqual(team_data["blockers_count"], 1)
        self.assertIn("active_member_activity", team_data)

    def test_scorecard_excludes_foreign_team(self):
        self.auth()
        response = self.client.get("/api/teams/scorecard/")

        ids = {item["team_id"] for item in response.json()}
        self.assertIn(self.team.id, ids)
        self.assertNotIn(self.foreign_team.id, ids)

    def test_activity_requires_authentication(self):
        response = self.client.get("/api/teams/activity/")
        self.assertEqual(response.status_code, 401)

    def test_activity_is_paginated_and_contains_supported_events(self):
        task = Task.objects.create(
            title="Shipped",
            board=self.board,
            created_by=self.user,
            status=Task.STATUS_DONE,
            completed_at=timezone.now(),
            completed_by=self.member,
        )
        project = Project.objects.create(
            name="Website",
            team=self.team,
            team_lead=self.user,
            created_by=self.user,
            status=Project.STATUS_AT_RISK,
        )
        Document.objects.create(title="Plan", owner=self.member)

        self.auth()
        response = self.client.get("/api/teams/activity/?page=1&page_size=2")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 4)
        self.assertEqual(len(data["results"]), 2)
        types = {event["event_type"] for event in data["results"]}
        self.assertTrue(types.intersection({
            "task_completed",
            "member_joined",
            "project_status_changed",
            "document_uploaded",
        }))

        all_response = self.client.get("/api/teams/activity/?page_size=100")
        all_types = {event["event_type"] for event in all_response.json()["results"]}
        self.assertIn("task_completed", all_types)
        self.assertIn("member_joined", all_types)
        self.assertIn("project_status_changed", all_types)
        self.assertIn("document_uploaded", all_types)

    def test_activity_excludes_foreign_team_events(self):
        foreign_board = Board.objects.create(
            name="Foreign Board",
            board_type=Board.BOARD_TYPE_TEAM,
            team=self.foreign_team,
        )
        Task.objects.create(
            title="Foreign task",
            board=foreign_board,
            created_by=self.outsider,
            status=Task.STATUS_DONE,
            completed_at=timezone.now(),
        )

        self.auth()
        response = self.client.get("/api/teams/activity/?page_size=100")

        team_ids = {event["team_id"] for event in response.json()["results"]}
        self.assertNotIn(self.foreign_team.id, team_ids)
