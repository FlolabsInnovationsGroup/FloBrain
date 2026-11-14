"""
API tests for Task 7B:
POST /api/teams/{id}/members/ and DELETE /api/teams/{id}/members/{user_id}/.
"""
import uuid

from django.test import TestCase
from rest_framework.test import APIClient

from teams.models import Team, TeamMember
from users.jwt_utils import make_access_token
from users.models import User


class TeamMemberApiSetup(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.lead = User.objects.create(
            email="lead@example.com", password_hash="x"
        )
        self.member = User.objects.create(
            email="member@example.com", password_hash="x"
        )
        self.candidate = User.objects.create(
            email="intern@example.com", password_hash="x"
        )

        self.lead_token = make_access_token(str(self.lead.id))
        self.member_token = make_access_token(str(self.member.id))

        self.team = Team.objects.create(
            name="Platform",
            description="Core product team",
            created_by=self.lead,
        )
        TeamMember.objects.create(team=self.team, user=self.lead, role="lead")
        TeamMember.objects.create(team=self.team, user=self.member, role="member")

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def members_url(self, team_id=None):
        return f"/api/teams/{self.team.id if team_id is None else team_id}/members/"

    def member_url(self, user_id, team_id=None):
        team_id = self.team.id if team_id is None else team_id
        return f"/api/teams/{team_id}/members/{user_id}/"


class TeamAddMemberViewTests(TeamMemberApiSetup):

    def test_lead_can_add_member_and_response_includes_updated_team(self):
        self.auth(self.lead_token)
        response = self.client.post(
            self.members_url(),
            {"user_id": str(self.candidate.id), "role": "intern"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.team.id)
        self.assertEqual(data["name"], "Platform")
        self.assertEqual(data["description"], "Core product team")
        self.assertEqual(data["created_by"]["id"], str(self.lead.id))
        for field in ["members", "created_at", "updated_at"]:
            self.assertIn(field, data)

        added = next(
            item for item in data["members"] if item["user_id"] == str(self.candidate.id)
        )
        self.assertEqual(added["role"], "intern")
        self.assertEqual(len(data["members"]), 3)

        membership = TeamMember.objects.get(team=self.team, user=self.candidate)
        self.assertEqual(membership.role, "intern")

    def test_non_lead_cannot_add_member(self):
        self.auth(self.member_token)
        response = self.client.post(
            self.members_url(),
            {"user_id": str(self.candidate.id), "role": "intern"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"], "Only team leads can add members")
        self.assertFalse(
            TeamMember.objects.filter(team=self.team, user=self.candidate).exists()
        )

    def test_duplicate_membership_returns_exact_error(self):
        self.auth(self.lead_token)
        response = self.client.post(
            self.members_url(),
            {"user_id": str(self.member.id), "role": "intern"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {"error": "User is already a member of this team"},
        )
        self.assertEqual(
            TeamMember.objects.get(team=self.team, user=self.member).role,
            "member",
        )

    def test_post_without_token_returns_401(self):
        response = self.client.post(
            self.members_url(),
            {"user_id": str(self.candidate.id), "role": "intern"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"], "Authentication required")
        self.assertFalse(
            TeamMember.objects.filter(team=self.team, user=self.candidate).exists()
        )

    def test_post_with_invalid_token_returns_401(self):
        self.auth("not-a-real-token")
        response = self.client.post(
            self.members_url(),
            {"user_id": str(self.candidate.id), "role": "intern"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_invalid_user_id_returns_400(self):
        self.auth(self.lead_token)
        response = self.client.post(
            self.members_url(),
            {"user_id": "not-a-uuid", "role": "intern"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data["error"], "Validation failed")
        self.assertIn("user_id", data["details"])
        self.assertEqual(TeamMember.objects.filter(team=self.team).count(), 2)

    def test_nonexistent_user_id_returns_400(self):
        self.auth(self.lead_token)
        response = self.client.post(
            self.members_url(),
            {"user_id": str(uuid.uuid4()), "role": "intern"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data["error"], "Validation failed")
        self.assertIn("user_id", data["details"])
        self.assertEqual(TeamMember.objects.filter(team=self.team).count(), 2)

    def test_nonexistent_team_returns_404(self):
        self.auth(self.lead_token)
        response = self.client.post(
            self.members_url(team_id=999999),
            {"user_id": str(self.candidate.id), "role": "intern"},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"error": "Team not found"})
        self.assertFalse(
            TeamMember.objects.filter(user=self.candidate).exists()
        )


class TeamRemoveMemberViewTests(TeamMemberApiSetup):

    def test_lead_can_remove_member(self):
        self.auth(self.lead_token)
        response = self.client.delete(self.member_url(self.member.id))

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")
        self.assertFalse(
            TeamMember.objects.filter(team=self.team, user=self.member).exists()
        )

        detail = self.client.get(f"/api/teams/{self.team.id}/")
        self.assertEqual(detail.status_code, 200)
        user_ids = {item["user_id"] for item in detail.json()["members"]}
        self.assertNotIn(str(self.member.id), user_ids)
        self.assertIn(str(self.lead.id), user_ids)

    def test_non_lead_cannot_remove_member(self):
        self.auth(self.member_token)
        response = self.client.delete(self.member_url(self.lead.id))

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json()["error"], "Only team leads can remove members"
        )
        self.assertTrue(
            TeamMember.objects.filter(team=self.team, user=self.lead).exists()
        )

    def test_lead_cannot_remove_themselves(self):
        self.auth(self.lead_token)
        response = self.client.delete(self.member_url(self.lead.id))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {"error": "Team lead cannot remove themselves"},
        )
        self.assertTrue(
            TeamMember.objects.filter(team=self.team, user=self.lead, role="lead").exists()
        )

    def test_delete_without_token_returns_401(self):
        response = self.client.delete(self.member_url(self.member.id))

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"], "Authentication required")
        self.assertTrue(
            TeamMember.objects.filter(team=self.team, user=self.member).exists()
        )

    def test_delete_with_invalid_token_returns_401(self):
        self.auth("not-a-real-token")
        response = self.client.delete(self.member_url(self.member.id))

        self.assertEqual(response.status_code, 401)
        self.assertTrue(
            TeamMember.objects.filter(team=self.team, user=self.member).exists()
        )

    def test_invalid_user_id_returns_404(self):
        self.auth(self.lead_token)
        response = self.client.delete(self.member_url("not-a-uuid"))

        self.assertEqual(response.status_code, 404)
        self.assertEqual(TeamMember.objects.filter(team=self.team).count(), 2)

    def test_nonexistent_membership_returns_404(self):
        self.auth(self.lead_token)
        response = self.client.delete(self.member_url(self.candidate.id))

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"error": "Member not found"})
        self.assertEqual(TeamMember.objects.filter(team=self.team).count(), 2)

    def test_nonexistent_user_uuid_returns_404(self):
        self.auth(self.lead_token)
        response = self.client.delete(self.member_url(uuid.uuid4()))

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"error": "Member not found"})

    def test_nonexistent_team_returns_404(self):
        self.auth(self.lead_token)
        response = self.client.delete(self.member_url(self.member.id, team_id=999999))

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"error": "Team not found"})
        self.assertTrue(
            TeamMember.objects.filter(team=self.team, user=self.member).exists()
        )
