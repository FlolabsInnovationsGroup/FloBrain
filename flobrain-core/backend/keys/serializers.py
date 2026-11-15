from rest_framework import serializers

from .models import CredentialVersion, ProviderCredential


class UserKeyListSerializer(serializers.ModelSerializer):
    version = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()

    class Meta:
        model = ProviderCredential
        fields = ["id", "provider", "source", "label", "scope_id", "version", "state", "created_at", "updated_at"]

    def get_version(self, obj):
        v = obj.versions.exclude(state=CredentialVersion.STATE_DELETED).order_by("-version").first()
        return v.version if v else None

    def get_state(self, obj):
        v = obj.versions.exclude(state=CredentialVersion.STATE_DELETED).order_by("-version").first()
        return v.state if v else None


class UserKeyCreateSerializer(serializers.Serializer):
    api_key = serializers.CharField(write_only=True, min_length=8, max_length=512)
    provider = serializers.ChoiceField(choices=ProviderCredential.PROVIDER_CHOICES)
    label = serializers.CharField(max_length=255, required=False, default="", allow_blank=True)
    permitted_targets = serializers.ListField(
        child=serializers.DictField(), required=False, allow_empty=False
    )

    def validate_api_key(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("API key cannot be blank.")
        return value.strip()


class CredentialResolveSerializer(serializers.Serializer):
    context_token = serializers.CharField()
