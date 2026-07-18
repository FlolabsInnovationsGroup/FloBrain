"""memory/models.py — Extended with Team + TeamMembership models (P1.W3.05-06).

Existing models preserved unchanged. New models added at the bottom:
  - Team: a group of users sharing memories
  - TeamMembership: many-to-many between User and Team with roles

MemoryNode gets a new nullable team_id ForeignKey to support team-scoped memories.
Existing nodes (team_id=null) remain private to their owner.
"""
from django.db import models
from django.utils import timezone


class TokenDictionary(models.Model):
    word = models.CharField(max_length=255, unique=True, db_index=True)
    ref_count = models.PositiveIntegerField(default=0, db_index=True)
    last_accessed_at = models.DateTimeField(default=timezone.now, db_index=True)
    frequency_score = models.IntegerField(default=0, db_index=True)

    class Meta:
        db_table = "token_dictionary"
        indexes = [
            models.Index(fields=['frequency_score', 'last_accessed_at']),
        ]

    def __str__(self):
        return self.word


class Team(models.Model):
    """A group of users sharing memory nodes (P1.W3.05)."""
    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255, db_index=True)
    owner_id = models.CharField(max_length=64, db_index=True)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "memory_teams"

    def __str__(self):
        return self.name


class TeamMembership(models.Model):
    """Many-to-many between user and Team with role (P1.W3.05)."""
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
        ("viewer", "Viewer"),
    ]
    id = models.AutoField(primary_key=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    user_id = models.CharField(max_length=64, db_index=True)
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "memory_team_memberships"
        unique_together = [("team", "user_id")]
        indexes = [
            models.Index(fields=['user_id', 'team']),
        ]

    def __str__(self):
        return f"{self.user_id} @ {self.team_id} ({self.role})"


class MemoryNode(models.Model):
    id = models.CharField(max_length=64, primary_key=True, db_index=True)
    owner_id = models.CharField(max_length=64, db_index=True, default="system")
    name = models.TextField(default="untitled")
    binary_index = models.IntegerField(default=1, db_index=True)
    tier_level = models.IntegerField(
        choices=[
            (1, "Tier 1: Active Buffer"),
            (2, "Tier 2: Associative Layer"),
            (3, "Tier 3: Cold Vault")
        ],
        default=1,
    )
    metadata = models.JSONField(default=dict, blank=True)
    memory_type = models.CharField(
        max_length=32,
        choices=[
            ("chunk", "Chunk"),
            ("summary", "Summary"),
            ("interaction", "Interaction"),
            ("workflow", "Workflow"),
        ],
        default="chunk",
        db_index=True,
    )
    relevance = models.FloatField(default=1.0)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    content_hash = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    size_bytes = models.PositiveIntegerField(default=0, help_text="Size of raw or compressed payload")
    is_locked = models.BooleanField(default=False, help_text="Prevents GC from touching this node")

    # P1.W3.06: Team scoping for shared memories. null = private to owner.
    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        related_name="memory_nodes",
        null=True,
        blank=True,
        db_index=True,
    )

    class Meta:
        db_table = "memory_nodes"
        indexes = [
            models.Index(fields=['tier_level', 'created_at']),
            models.Index(fields=['owner_id', 'tier_level']),
            models.Index(fields=['team', 'tier_level']),  # P1.W3.07: ACL query optimization
        ]

    def __str__(self):
        return self.name


class MemoryLink(models.Model):
    source = models.ForeignKey(
        MemoryNode,
        on_delete=models.CASCADE,
        related_name="outgoing_links",
    )
    target = models.ForeignKey(
        MemoryNode,
        on_delete=models.CASCADE,
        related_name="incoming_links",
    )
    relation = models.CharField(max_length=64, default="associated")
    weight = models.FloatField(default=0.5)

    class Meta:
        db_table = "memory_links"
        indexes = [
            models.Index(fields=['source', 'target', 'weight']),
        ]
