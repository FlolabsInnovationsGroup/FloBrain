from rest_framework import serializers

from .models import AIModel


class AIModelSerializer(serializers.ModelSerializer):
    supported_input_types = serializers.ListField(
        child=serializers.ChoiceField(choices=AIModel.INPUT_TYPE_CHOICES),
        allow_empty=False,
    )
    capabilities = serializers.ListField(
        child=serializers.CharField(
            max_length=100,
            allow_blank=False,
            trim_whitespace=True,
        ),
        allow_empty=False,
    )

    class Meta:
        model = AIModel
        fields = [
            "id",
            "name",
            "provider_name",
            "provider_type",
            "supported_input_types",
            "capabilities",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    @staticmethod
    def _deduplicate(values):
        seen = set()
        result = []
        for value in values:
            key = value.casefold() if isinstance(value, str) else value
            if key not in seen:
                seen.add(key)
                result.append(value)
        return result

    def validate_supported_input_types(self, value):
        return self._deduplicate(value)

    def validate_capabilities(self, value):
        return self._deduplicate(value)

    def validate(self, attrs):
        instance = self.instance
        name = attrs.get("name", getattr(instance, "name", None))
        provider_name = attrs.get(
            "provider_name",
            getattr(instance, "provider_name", None),
        )

        if name and provider_name:
            matches = AIModel.objects.filter(
                name__iexact=name,
                provider_name__iexact=provider_name,
            )
            if instance is not None:
                matches = matches.exclude(pk=instance.pk)
            if matches.exists():
                raise serializers.ValidationError(
                    {"name": "This provider already has a model with this name."}
                )

        return attrs
