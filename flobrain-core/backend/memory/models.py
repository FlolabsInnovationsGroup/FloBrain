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

    class Meta:
        db_table = "memory_nodes"
        indexes = [
            models.Index(fields=['tier_level', 'created_at']),
            models.Index(fields=['owner_id', 'tier_level']),
        ]

    @property
    def val(self):
        """Graph node size derived from relevance."""
        return float(self.relevance or 1.0)

    @property
    def group(self):
        """Graph color group derived from memory type."""
        groups = {"chunk": 1, "summary": 2, "interaction": 3, "workflow": 4}
        return groups.get(self.memory_type, 1)

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