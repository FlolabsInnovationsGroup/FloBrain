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

    # Canonical memory text (source of truth); `name` is only a display title.
    content = models.TextField(blank=True, default="")
    is_excluded = models.BooleanField(default=False, db_index=True)
    superseded_by = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="supersedes",
    )
    # Provenance only; not foreign keys so memories survive chat deletion.
    source_chat_id = models.IntegerField(null=True, blank=True)
    source_message_id = models.IntegerField(null=True, blank=True)

    INDEX_PENDING = "pending"
    INDEX_INDEXED = "indexed"
    INDEX_FAILED = "failed"
    index_status = models.CharField(
        max_length=16,
        choices=[
            (INDEX_PENDING, "Pending"),
            (INDEX_INDEXED, "Indexed"),
            (INDEX_FAILED, "Failed"),
        ],
        default=INDEX_PENDING,
        db_index=True,
    )
    index_error = models.TextField(blank=True, default="")

    class Meta:
        db_table = "memory_nodes"
        indexes = [
            models.Index(fields=['tier_level', 'created_at']),
            models.Index(fields=['owner_id', 'tier_level']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['owner_id', 'source_message_id'],
                condition=models.Q(source_message_id__isnull=False),
                name='memory_node_unique_owner_source_message',
            ),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        metadata = dict(self.metadata or {})
        if not self.content:
            self.content = metadata.get("raw_text") or self.name or ""
        # Transition: mirror canonical content for readers of metadata.raw_text
        if metadata.get("raw_text") != self.content:
            metadata["raw_text"] = self.content
            self.metadata = metadata
        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            kwargs["update_fields"] = set(update_fields) | {"content", "metadata"}
        super().save(*args, **kwargs)

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
