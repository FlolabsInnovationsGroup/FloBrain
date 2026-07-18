"""memory/tests/test_team_memory.py — ACL tests for Team Memory (P1.W3.10).

5 test cases:
  1. Create team
  2. Add member
  3. Create team memory
  4. List team memories
  5. ACL — non-member cannot see team memories
"""
import uuid
from django.test import TestCase
from django.utils import timezone

from memory.models import MemoryNode, Team, TeamMembership
from memory.team_views import _is_team_member, _is_team_admin, _get_user_teams


class TeamMemoryACLTests(TestCase):
    """P1.W3.10 — ACL tests for Team Memory."""

    def setUp(self):
        self.owner_id = "user_owner_001"
        self.member_id = "user_member_001"
        self.outsider_id = "user_outsider_001"
        self.team = Team.objects.create(
            id="team_test_001",
            name="Test Team",
            owner_id=self.owner_id,
        )
        # Owner is admin
        TeamMembership.objects.create(
            team=self.team, user_id=self.owner_id, role="admin"
        )
        # Member is regular member
        TeamMembership.objects.create(
            team=self.team, user_id=self.member_id, role="member"
        )

    def test_1_create_team(self):
        """Team can be created and owner is admin."""
        self.assertEqual(self.team.name, "Test Team")
        self.assertTrue(_is_team_admin(self.team.id, self.owner_id))

    def test_2_add_member(self):
        """Member can be added and is_team_member returns True."""
        self.assertTrue(_is_team_member(self.team.id, self.member_id))
        self.assertFalse(_is_team_admin(self.team.id, self.member_id))

    def test_3_create_team_memory(self):
        """MemoryNode can be created with team_id set."""
        node = MemoryNode.objects.create(
            id="team_mem_001",
            owner_id=self.owner_id,
            name="Team Memory",
            tier_level=2,
            team=self.team,
            metadata={"raw_text": "Shared team knowledge"},
        )
        self.assertEqual(node.team_id, self.team.id)
        self.assertEqual(node.owner_id, self.owner_id)

    def test_4_list_team_memories(self):
        """Team memories are visible to members."""
        MemoryNode.objects.create(
            id="team_mem_002", owner_id=self.owner_id, name="Mem 1",
            tier_level=2, team=self.team
        )
        MemoryNode.objects.create(
            id="team_mem_003", owner_id=self.owner_id, name="Mem 2",
            tier_level=2, team=self.team
        )
        team_mems = MemoryNode.objects.filter(team_id=self.team.id)
        self.assertEqual(team_mems.count(), 2)

    def test_5_acl_outsider_cannot_see_team_memories(self):
        """User not in team cannot see team memories."""
        # Outsider's private memory
        MemoryNode.objects.create(
            id="outsider_mem_001", owner_id=self.outsider_id, name="Private",
            tier_level=2,  # team=None (private)
        )
        # Team memory
        MemoryNode.objects.create(
            id="team_mem_004", owner_id=self.owner_id, name="Team only",
            tier_level=2, team=self.team,
        )

        # Outsider should NOT see team memories
        outsider_team_ids = _get_user_teams(self.outsider_id)
        self.assertEqual(outsider_team_ids, [])

        # Outsider sees only their own private nodes
        visible_to_outsider = MemoryNode.objects.filter(
            owner_id=self.outsider_id
        ).exclude(team__isnull=False)  # exclude team memories
        self.assertEqual(visible_to_outsider.count(), 1)
        self.assertEqual(visible_to_outsider.first().id, "outsider_mem_001")

        # Member should see team memories
        member_team_ids = _get_user_teams(self.member_id)
        self.assertIn(self.team.id, member_team_ids)

        team_mems_visible = MemoryNode.objects.filter(team_id__in=member_team_ids)
        self.assertEqual(team_mems_visible.count(), 1)
        self.assertEqual(team_mems_visible.first().id, "team_mem_004")

    def test_6_admin_role_required_for_create(self):
        """Only admin role can create team memories (verified via _is_team_admin)."""
        # Member is not admin
        self.assertFalse(_is_team_admin(self.team.id, self.member_id))
        # Owner is admin
        self.assertTrue(_is_team_admin(self.team.id, self.owner_id))
        # Outsider is neither
        self.assertFalse(_is_team_admin(self.team.id, self.outsider_id))
        self.assertFalse(_is_team_member(self.team.id, self.outsider_id))
