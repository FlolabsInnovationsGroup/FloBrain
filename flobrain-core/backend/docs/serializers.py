from rest_framework import serializers
from .models import Document, DocumentAttachment


class DocumentListSerializer(serializers.ModelSerializer):
    """Compact read serializer for the library list view."""

    class Meta:
        model = Document
        fields = ["id", "title", "is_favorite", "updated_at"]
        read_only_fields = fields


class DocumentDetailSerializer(serializers.ModelSerializer):
    """Full read serializer including content, used for the editor view."""

    class Meta:
        model = Document
        fields = ["id", "title", "content", "is_favorite", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["title", "content"]
        extra_kwargs = {
            "title": {"required": False},
            "content": {"required": False},
        }


class DocumentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["title", "content", "is_favorite"]
        extra_kwargs = {
            "title": {"required": False},
            "content": {"required": False},
            "is_favorite": {"required": False},
        }


class AttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        request = self.context.get("request")
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

    class Meta:
        model = DocumentAttachment
        fields = ["id", "name", "file_url", "is_favorite", "created_at"]
        read_only_fields = fields


class AttachmentCreateSerializer(serializers.Serializer):
    file = serializers.FileField()
    name = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get("name"):
            attrs["name"] = attrs["file"].name
        return attrs


class AttachmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentAttachment
        fields = ["name", "is_favorite"]
        extra_kwargs = {
            "name": {"required": False},
            "is_favorite": {"required": False},
        }
