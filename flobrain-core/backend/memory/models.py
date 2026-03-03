from django.db import models
from django.utils import timezone


class MemoryNode(models.Model):
    """Single node in the memory graph (chunk, summary, interaction, workflow)."""

    id = models.CharField(max_length=64, primary_key=True, db_index=True)
    name = models.CharField(max_length=512)
    val = models.FloatField(default=10.0)  # used for node size / relevance
    group = models.CharField(max_length=64, db_index=True)  # e.g. core, front, back, ai
    memory_type = models.CharField(
        max_length=32,
        choices=[
            ("chunk", "Chunks"),
            ("summary", "Summaries"),
            ("interaction", "Interactions"),
            ("workflow", "Workflows"),
        ],
        default="chunk",
        db_index=True,
    )
    relevance = models.FloatField(default=1.0)  # 0..1 for filtering
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "memory_nodes"

    def __str__(self):
        return self.name


class MemoryLink(models.Model):
    """Directed link between two memory nodes."""

    source = models.ForeignKey(
        MemoryNode,
        on_delete=models.CASCADE,
        related_name="outgoing_links",
        db_column="source_id",
        to_field="id",
    )
    target = models.ForeignKey(
        MemoryNode,
        on_delete=models.CASCADE,
        related_name="incoming_links",
        db_column="target_id",
        to_field="id",
    )

    class Meta:
        db_table = "memory_links"
        unique_together = [["source", "target"]]

    def __str__(self):
        return f"{self.source_id} -> {self.target_id}"
