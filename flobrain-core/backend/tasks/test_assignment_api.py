"""
Tests for the B4 Assignment API:

- POST   /api/tasks/{task_id}/assign/
- DELETE /api/tasks/{task_id}/assign/
- GET    /api/tasks/assigned-to-me/
- GET    /api/tasks/created-by-me/
"""
import datetime
import uuid

from django.test import TestCase
from rest_framework.test import APIClient

from teams.models import Team, TeamMember
from users.jwt_utils import make_access_token, make_refresh_token
from users.models import User

from .models import Board, Task


def assign_url(task_id):
    return f"/api/tasks/{task_id}/assign/"


ASSIGNED_TO_ME_URL = "/api/tasks/assigned-to-me/"
CREATED_BY_ME_URL = "/api/tasks/created-by-me/"


class AssignmentApiTestBase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.creator = self.make_user("creator")
        self.friend = self.make_user("friend")
        self.stranger = self.make_user("stranger")

        self.lead = self.make_user("lead")
        self.member = self.make_user("member")
        self.intern = self.make_user("intern")
        self.other_lead = self.make_user("otherlead")

        # Personal board owned by `creator`.
        self.personal_board = Board.objects.create(
            name="Personal Board",
            board_type=Board.BOARD_TYPE_PERSONAL,
            owner=self.creator,
        )
        self.personal_task = Task.objects.create(
            title="Personal task",
            board=self.personal_board,
            created_by=self.creator,
        )

        # Team with a lead, a member and an intern.
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

        # A second team that `other_lead` leads; none of the Alpha users
        # belong to it.
        self.other_team = Team.objects.create(
            name="Beta", created_by=self.other_lead
        )
        TeamMember.objects.create(
            team=self.other_team, user=self.other_lead, role="lead"
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

    def unauth(self):
        self.client.credentials()


class AssignTaskTests(AssignmentApiTestBase):
    # --- Authentication -------------------------------------------------

    def test_requires_authentication(self):
        response = self.client.post(
            assign_url(self.personal_task.id),
            {"user_id": str(self.friend.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_rejects_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
        response = self.client.post(
            assign_url(self.personal_task.id),
            {"user_id": str(self.friend.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_rejects_refresh_token(self):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {make_refresh_token(str(self.creator.id))}"
        )
        response = self.client.post(
            assign_url(self.personal_task.id),
            {"user_id": str(self.friend.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    # --- Personal boards ------------------------------------------------

    def test_creator_can_assign_personal_task(self):
        self.auth(self.creator)
        response = self.client.post(
            assign_url(self.personal_task.id),
            {"user_id": str(self.friend.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.personal_task.id)
        self.assertEqual(
            response.data["assigned_to"],
            {"id": str(self.friend.id), "name": "friend"},
        )
        self.personal_task.refresh_from_db()
        self.assertEqual(self.personal_task.assigned_to, self.friend)

    def test_assignee_who_is_not_creator_cannot_reassign_personal_task(self):
        self.personal_task.assigned_to = self.friend
        self.personal_task.save()

        self.auth(self.friend)
        response = self.client.post(
            assign_url(self.personal_task.id),
            {"user_id": str(self.stranger.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.personal_task.refresh_from_db()
        self.assertEqual(self.personal_task.assigned_to, self.friend)

    def test_other_users_personal_task_returns_404(self):
        self.auth(self.stranger)
        response = self.client.post(
            assign_url(self.personal_task.id),
            {"user_id": str(self.stranger.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
        self.personal_task.refresh_from_db()
        self.assertIsNone(self.personal_task.assigned_to)

    # --- Team boards ----------------------------------------------------

    def test_lead_can_assign_team_member(self):
        self.auth(self.lead)
        response = self.client.post(
            assign_url(self.team_task.id),
            {"user_id": str(self.member.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_to"]["id"], str(self.member.id))
        self.team_task.refresh_from_db()
        self.assertEqual(self.team_task.assigned_to, self.member)

    def test_lead_cannot_assign_user_outside_team(self):
        self.auth(self.lead)
        response = self.client.post(
            assign_url(self.team_task.id),
            {"user_id": str(self.stranger.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("user_id", response.data)
        self.team_task.refresh_from_db()
        self.assertIsNone(self.team_task.assigned_to)

    def test_member_cannot_assign_team_task(self):
        self.auth(self.member)
        response = self.client.post(
            assign_url(self.team_task.id),
            {"user_id": str(self.member.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.team_task.refresh_from_db()
        self.assertIsNone(self.team_task.assigned_to)

    def test_intern_cannot_assign_team_task(self):
        self.auth(self.intern)
        response = self.client.post(
            assign_url(self.team_task.id),
            {"user_id": str(self.intern.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_non_member_gets_404_for_team_task(self):
        self.auth(self.stranger)
        response = self.client.post(
            assign_url(self.team_task.id),
            {"user_id": str(self.member.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_lead_of_another_team_gets_404(self):
        self.auth(self.other_lead)
        response = self.client.post(
            assign_url(self.team_task.id),
            {"user_id": str(self.member.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
        self.team_task.refresh_from_db()
        self.assertIsNone(self.team_task.assigned_to)

    # --- Input validation ----------------------------------------------

    def test_missing_task_returns_404(self):
        self.auth(self.creator)
        response = self.client.post(
            assign_url(999999),
            {"user_id": str(self.friend.id)},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_missing_user_id_returns_400(self):
        self.auth(self.creator)
        response = self.client.post(
            assign_url(self.personal_task.id), {}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("user_id", response.data)

    def test_malformed_user_id_returns_400(self):
        self.auth(self.creator)
        response = self.client.post(
            assign_url(self.personal_task.id),
            {"user_id": "not-a-uuid"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("user_id", response.data)

    def test_unknown_user_id_returns_400(self):
        self.auth(self.creator)
        response = self.client.post(
            assign_url(self.personal_task.id),
            {"user_id": str(uuid.uuid4())},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("user_id", response.data)
        self.personal_task.refresh_from_db()
        self.assertIsNone(self.personal_task.assigned_to)

    def test_get_method_not_allowed(self):
        self.auth(self.creator)
        response = self.client.get(assign_url(self.personal_task.id))
        self.assertEqual(response.status_code, 405)


class UnassignTaskTests(AssignmentApiTestBase):
    def setUp(self):
        super().setUp()
        self.personal_task.assigned_to = self.friend
        self.personal_task.save()
        self.team_task.assigned_to = self.member
        self.team_task.save()

    def test_requires_authentication(self):
        response = self.client.delete(assign_url(self.personal_task.id))
        self.assertEqual(response.status_code, 401)

    def test_creator_can_unassign_personal_task(self):
        self.auth(self.creator)
        response = self.client.delete(assign_url(self.personal_task.id))

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["assigned_to"])
        self.personal_task.refresh_from_db()
        self.assertIsNone(self.personal_task.assigned_to)

    def test_assignee_cannot_unassign_personal_task(self):
        self.auth(self.friend)
        response = self.client.delete(assign_url(self.personal_task.id))

        self.assertEqual(response.status_code, 403)
        self.personal_task.refresh_from_db()
        self.assertEqual(self.personal_task.assigned_to, self.friend)

    def test_stranger_gets_404_for_personal_task(self):
        self.auth(self.stranger)
        response = self.client.delete(assign_url(self.personal_task.id))
        self.assertEqual(response.status_code, 404)

    def test_lead_can_unassign_team_task(self):
        self.auth(self.lead)
        response = self.client.delete(assign_url(self.team_task.id))

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["assigned_to"])
        self.team_task.refresh_from_db()
        self.assertIsNone(self.team_task.assigned_to)

    def test_member_cannot_unassign_team_task(self):
        self.auth(self.member)
        response = self.client.delete(assign_url(self.team_task.id))

        self.assertEqual(response.status_code, 403)
        self.team_task.refresh_from_db()
        self.assertEqual(self.team_task.assigned_to, self.member)

    def test_non_member_gets_404_for_team_task(self):
        self.auth(self.other_lead)
        response = self.client.delete(assign_url(self.team_task.id))

        self.assertEqual(response.status_code, 404)
        self.team_task.refresh_from_db()
        self.assertEqual(self.team_task.assigned_to, self.member)

    def test_missing_task_returns_404(self):
        self.auth(self.creator)
        response = self.client.delete(assign_url(999999))
        self.assertEqual(response.status_code, 404)


class AssignedToMeTests(AssignmentApiTestBase):
    def test_requires_authentication(self):
        response = self.client.get(ASSIGNED_TO_ME_URL)
        self.assertEqual(response.status_code, 401)

    def test_returns_personal_and_team_tasks_ordered_by_due_date(self):
        today = datetime.date(2026, 1, 10)

        # member's own personal board task, assigned to themselves.
        member_board = Board.objects.create(
            name="Personal Board",
            board_type=Board.BOARD_TYPE_PERSONAL,
            owner=self.member,
        )
        personal = Task.objects.create(
            title="Member personal",
            board=member_board,
            created_by=self.member,
            assigned_to=self.member,
            due_date=today + datetime.timedelta(days=5),
        )

        self.team_task.assigned_to = self.member
        self.team_task.due_date = today
        self.team_task.save()

        no_due_date = Task.objects.create(
            title="No due date",
            board=self.team_board,
            created_by=self.lead,
            assigned_to=self.member,
        )

        # Not assigned to member -> must not appear.
        Task.objects.create(
            title="Assigned to intern",
            board=self.team_board,
            created_by=self.lead,
            assigned_to=self.intern,
            due_date=today,
        )

        self.auth(self.member)
        response = self.client.get(ASSIGNED_TO_ME_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [task["id"] for task in response.data],
            [self.team_task.id, personal.id, no_due_date.id],
        )
        board_types = {task["board"]["board_type"] for task in response.data}
        self.assertEqual(board_types, {"personal", "team"})

    def test_includes_personal_task_assigned_by_someone_else(self):
        self.personal_task.assigned_to = self.friend
        self.personal_task.save()

        self.auth(self.friend)
        response = self.client.get(ASSIGNED_TO_ME_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [task["id"] for task in response.data], [self.personal_task.id]
        )

    def test_does_not_return_other_users_tasks(self):
        self.personal_task.assigned_to = self.friend
        self.personal_task.save()

        self.auth(self.stranger)
        response = self.client.get(ASSIGNED_TO_ME_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_excludes_team_tasks_after_user_leaves_team(self):
        self.team_task.assigned_to = self.member
        self.team_task.save()
        TeamMember.objects.filter(team=self.team, user=self.member).delete()

        self.auth(self.member)
        response = self.client.get(ASSIGNED_TO_ME_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])


class CreatedByMeTests(AssignmentApiTestBase):
    def test_requires_authentication(self):
        response = self.client.get(CREATED_BY_ME_URL)
        self.assertEqual(response.status_code, 401)

    def test_returns_only_tasks_created_by_user(self):
        second_team_task = Task.objects.create(
            title="Second team task",
            board=self.team_board,
            created_by=self.lead,
        )
        # Created by someone else on the same board -> must not appear.
        Task.objects.create(
            title="Member's team task",
            board=self.team_board,
            created_by=self.member,
        )

        self.auth(self.lead)
        response = self.client.get(CREATED_BY_ME_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            sorted(task["id"] for task in response.data),
            sorted([self.team_task.id, second_team_task.id]),
        )
        for task in response.data:
            self.assertEqual(task["created_by"], str(self.lead.id))

    def test_returns_personal_tasks(self):
        self.auth(self.creator)
        response = self.client.get(CREATED_BY_ME_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [task["id"] for task in response.data], [self.personal_task.id]
        )
        self.assertEqual(
            response.data[0]["board"],
            {
                "id": self.personal_board.id,
                "name": "Personal Board",
                "board_type": "personal",
            },
        )

    def test_hides_tasks_on_boards_user_can_no_longer_access(self):
        member_task = Task.objects.create(
            title="Member's team task",
            board=self.team_board,
            created_by=self.member,
        )
        TeamMember.objects.filter(team=self.team, user=self.member).delete()

        self.auth(self.member)
        response = self.client.get(CREATED_BY_ME_URL)

        self.assertEqual(response.status_code, 200)
        self.assertNotIn(member_task.id, [task["id"] for task in response.data])
        self.assertEqual(response.data, [])

    def test_user_with_no_tasks_gets_empty_list(self):
        self.auth(self.stranger)
        response = self.client.get(CREATED_BY_ME_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
