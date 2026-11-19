"""
Seed the two OpenAI models currently approved for the multimodal integration.

Shutdown dates from the M2 interface proposal:
  gpt-4o-mini           → 2027-01-14  (generate_text)
  gpt-4o-mini-transcribe → 2027-02-26  (transcribe_audio)

Before those dates, add successor model IDs here and in a follow-up migration,
then notify the multimodal team so they can add them to their approved list.
"""
from django.db import migrations


OPENAI_MODELS = [
    {
        "name": "gpt-4o-mini",
        "provider_name": "openai",
        "provider_type": "private",
        "supported_input_types": ["text"],
        "capabilities": ["generate_text"],
    },
    {
        "name": "gpt-4o-mini-transcribe",
        "provider_name": "openai",
        "provider_type": "private",
        "supported_input_types": ["audio"],
        "capabilities": ["transcribe_audio"],
    },
]


def seed_models(apps, schema_editor):
    AIModel = apps.get_model("model_registry", "AIModel")
    for entry in OPENAI_MODELS:
        AIModel.objects.get_or_create(
            provider_name=entry["provider_name"],
            name=entry["name"],
            defaults={
                "provider_type": entry["provider_type"],
                "supported_input_types": entry["supported_input_types"],
                "capabilities": entry["capabilities"],
            },
        )


def unseed_models(apps, schema_editor):
    AIModel = apps.get_model("model_registry", "AIModel")
    AIModel.objects.filter(
        provider_name="openai",
        name__in=[m["name"] for m in OPENAI_MODELS],
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("model_registry", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_models, reverse_code=unseed_models),
    ]
