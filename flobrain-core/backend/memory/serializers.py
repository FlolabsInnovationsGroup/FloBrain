import json

from rest_framework import serializers

from .models import MemoryNode

MAX_CONTENT_CHARS = 10000
MAX_NAME_CHARS = 255
MAX_METADATA_BYTES = 4096


class MemorySaveSerializer(serializers.Serializer):
    """POST /api/memory/save/ payload. owner_id, id and embedding are never accepted."""

    content = serializers.CharField(max_length=MAX_CONTENT_CHARS)
    name = serializers.CharField(max_length=MAX_NAME_CHARS, required=False, allow_blank=True)
    memory_type = serializers.ChoiceField(
        choices=MemoryNode._meta.get_field("memory_type").choices, default="chunk"
    )
    importance = serializers.FloatField(min_value=0.0, max_value=1.0, default=0.5)
    metadata = serializers.DictField(required=False, default=dict)
    supersedes = serializers.CharField(max_length=64, required=False)

    def validate_metadata(self, value):
        if len(json.dumps(value, default=str).encode("utf-8")) > MAX_METADATA_BYTES:
            raise serializers.ValidationError(f"metadata must be at most {MAX_METADATA_BYTES} bytes")
        return value
