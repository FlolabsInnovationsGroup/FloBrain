import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("users", "0003_create_admin_role"),
    ]

    operations = [
        migrations.CreateModel(
            name="Document",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(default="Untitled Document", max_length=255)),
                ("content", models.TextField(blank=True, default="")),
                ("is_favorite", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="documents",
                    to="users.user",
                )),
            ],
            options={
                "db_table": "documents",
                "ordering": ["-updated_at"],
            },
        ),
        migrations.CreateModel(
            name="DocumentAttachment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("file", models.FileField(upload_to="attachments/%Y/%m/")),
                ("is_favorite", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("uploaded_by", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="attachments",
                    to="users.user",
                )),
            ],
            options={
                "db_table": "document_attachments",
                "ordering": ["-created_at"],
            },
        ),
    ]
