"""
API tests for Task 6: GET /api/teams/ and POST /api/teams/ (TeamListCreateView).
"""
from django.test import TestCase
from rest_framework.test import APIClient

from teams.models import Team, TeamMember
from users.jwt_utils import make_access_token, make_refresh_token
from users.models import User

URL = "/api/teams/"


class TeamListCreateViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create(
            email="me@example.com", password_hash="x"
        )
        self.other_user = User.objects.create(
            email="other@example.com", password_hash="x"
        )
        self.token = make_access_token(str(self.user.id))

    def auth(self, token=None):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token or self.token}"
        )

    # ---------- GET ----------

    def test_get_without_token_returns_401(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.json())

    def test_get_with_invalid_token_returns_401(self):
        self.auth("not-a-real-token")
        response = self.client.get(URL)
        self.assertEqual(response.status_code, 401)

    def test_get_with_refresh_token_returns_401(self):
        # Only access tokens are accepted, not refresh tokens.
        self.auth(make_refresh_token(str(self.user.id)))
        response = self.client.get(URL)
        self.assertEqual(response.status_code, 401)

    def test_get_returns_only_my_teams(self):
        # Team I created (and lead).
        created = Team.objects.create(name="Created by me", created_by=self.user)
        TeamMember.objects.create(team=created, user=self.user, role="lead")

        # Team someone else created, where I am a member.
        joined = Team.objects.create(name="I am a member", created_by=self.other_user)
        TeamMember.objects.create(team=joined, user=self.other_user, role="lead")
        TeamMember.objects.create(team=joined, user=self.user, role="member")

        # Team I created but am not a member of (still visible via created_by).
        created_only = Team.objects.create(name="Created only", created_by=self.user)

        # Someone else's team that I have nothing to do with.
        foreign = Team.objects.create(name="Not mine", created_by=self.other_user)
        TeamMember.objects.create(team=foreign, user=self.other_user, role="lead")

        self.auth()
        response = self.client.get(URL)

        self.assertEqual(response.status_code, 200)
        returned_ids = {team["id"] for team in response.json()}
        self.assertEqual(returned_ids, {created.id, joined.id, created_only.id})
        self.assertNotIn(foreign.id, returned_ids)

    def test_get_does_not_return_other_users_teams(self):
        foreign = Team.objects.create(name="Not mine", created_by=self.other_user)
        TeamMember.objects.create(team=foreign, user=self.other_user, role="lead")

        self.auth()
        response = self.client.get(URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_get_does_not_duplicate_team_when_creator_is_also_member(self):
        team = Team.objects.create(name="Both", created_by=self.user)
        TeamMember.objects.create(team=team, user=self.user, role="lead")
        # Extra members create extra join rows; the team must still appear once.
        TeamMember.objects.create(team=team, user=self.other_user, role="member")

        self.auth()
        response = self.client.get(URL)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], team.id)

    def test_get_response_fields(self):
        team = Team.objects.create(name="Fields", created_by=self.user)
        TeamMember.objects.create(team=team, user=self.user, role="lead")
        TeamMember.objects.create(team=team, user=self.other_user, role="member")

        self.auth()
        response = self.client.get(URL)

        item = response.json()[0]
        self.assertEqual(set(item.keys()), {"id", "name", "member_count", "created_at"})
        self.assertEqual(item["name"], "Fields")
        self.assertEqual(item["member_count"], 2)

    # ---------- POST ----------

    def test_post_without_token_returns_401(self):
        response = self.client.post(URL, {"name": "New team"}, format="json")
        self.assertEqual(response.status_code, 401)
        self.assertFalse(Team.objects.exists())

    def test_post_with_valid_data_returns_201(self):
        self.auth()
        response = self.client.post(
            URL,
            {"name": "New team", "description": "A test team"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["name"], "New team")
        self.assertEqual(data["description"], "A test team")
        self.assertEqual(data["created_by"]["id"], str(self.user.id))
        for field in ["id", "members", "created_at", "updated_at"]:
            self.assertIn(field, data)

        team = Team.objects.get(id=data["id"])
        self.assertEqual(team.created_by, self.user)

    def test_post_adds_creator_as_lead(self):
        self.auth()
        response = self.client.post(URL, {"name": "Lead team"}, format="json")

        self.assertEqual(response.status_code, 201)
        team_id = response.json()["id"]

        membership = TeamMember.objects.get(team_id=team_id, user=self.user)
        self.assertEqual(membership.role, "lead")

        members = response.json()["members"]
        self.assertEqual(len(members), 1)
        self.assertEqual(members[0]["user_id"], str(self.user.id))
        self.assertEqual(members[0]["role"], "lead")

    def test_post_invalid_data_returns_400_with_error_format(self):
        self.auth()
        response = self.client.post(URL, {"description": "No name"}, format="json")

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data["error"], "Validation failed")
        self.assertIn("name", data["details"])
        self.assertFalse(Team.objects.exists())

    def test_post_blank_name_returns_400(self):
        self.auth()
        response = self.client.post(URL, {"name": ""}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.json()["details"])
