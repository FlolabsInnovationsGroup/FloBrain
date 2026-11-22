# Generated manually for prompt_tokens / completion_tokens

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("brain", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="prompt_tokens",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="message",
            name="completion_tokens",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
