from django.test import TestCase
from users.models import User
from teams.models import Team, TeamMember
from teams.serializers import (
    TeamMemberSerializer,
    TeamListSerializer,
    TeamDetailSerializer,
    TeamCreateSerializer,
    TeamAddMemberSerializer,
)


class TeamSerializerTests(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            email="lead@example.com",
            password_hash="test-password"
        )

        self.team = Team.objects.create(
            name="AI Development Team",
            description="Team for AI projects",
            created_by=self.user
        )

    def test_team_member_serializer(self):
        member = TeamMember.objects.create(
            team=self.team,
            user=self.user,
            role="lead"
        )

        serializer = TeamMemberSerializer(member)

        self.assertEqual(serializer.data["user_id"], str(self.user.id))
        self.assertEqual(serializer.data["user_name"], self.user.email)
        self.assertEqual(serializer.data["role"], "lead")

    def test_team_list_serializer(self):
        TeamMember.objects.create(
            team=self.team,
            user=self.user,
            role="lead"
        )

        serializer = TeamListSerializer(self.team)

        self.assertEqual(serializer.data["name"], "AI Development Team")
        self.assertEqual(serializer.data["member_count"], 1)
        self.assertIn("created_at", serializer.data)

    def test_team_detail_serializer(self):
        TeamMember.objects.create(
            team=self.team,
            user=self.user,
            role="lead"
        )

        serializer = TeamDetailSerializer(self.team)

        self.assertEqual(serializer.data["name"], "AI Development Team")
        self.assertEqual(
            serializer.data["created_by"]["name"],
            self.user.email
        )
        self.assertEqual(len(serializer.data["members"]), 1)
        self.assertEqual(serializer.data["members"][0]["role"], "lead")

    def test_team_create_serializer(self):
        serializer = TeamCreateSerializer(
            data={
                "name": "Machine Learning Team",
                "description": "Team for ML projects"
            },
            context={"user": self.user}
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        team = serializer.save()

        self.assertEqual(team.name, "Machine Learning Team")
        self.assertEqual(team.created_by, self.user)

        membership = TeamMember.objects.get(
            team=team,
            user=self.user
        )

        self.assertEqual(membership.role, "lead")


    def test_team_add_member_serializer(self):
        new_user = User.objects.create(
            email="member@example.com",
            password_hash="test-password"
        )

        serializer = TeamAddMemberSerializer(
            data={"user_id": str(new_user.id)},
            context={"team": self.team}
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        member = serializer.save()

        self.assertEqual(member.user, new_user)
        self.assertEqual(member.team, self.team)
        self.assertEqual(member.role, "member")

    def test_team_add_member_rejects_duplicate_user(self):
        TeamMember.objects.create(
            team=self.team,
            user=self.user,
            role="lead"
        )

        serializer = TeamAddMemberSerializer(
            data={"user_id": str(self.user.id)},
            context={"team": self.team}
        )

        self.assertFalse(serializer.is_valid())

    def test_team_add_member_rejects_invalid_user(self):
        import uuid

        serializer = TeamAddMemberSerializer(
            data={"user_id": str(uuid.uuid4())},
            context={"team": self.team}
        )

        self.assertFalse(serializer.is_valid())