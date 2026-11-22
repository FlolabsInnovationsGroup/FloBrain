import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("teams", "0002_alter_team_options_alter_team_created_by_and_more"),
        ("users", "0003_create_admin_role"),
    ]

    operations = [
        migrations.CreateModel(
            name="Project",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("progress", models.IntegerField(default=0)),
                ("status", models.CharField(
                    choices=[
                        ("on_track", "On Track"),
                        ("at_risk", "At Risk"),
                        ("completed", "Completed"),
                    ],
                    db_index=True,
                    default="on_track",
                    max_length=20,
                )),
                ("target_date", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("team", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="team_projects",
                    to="teams.team",
                )),
                ("team_lead", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="led_projects",
                    to="users.user",
                )),
                ("created_by", models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="created_projects",
                    to="users.user",
                )),
            ],
            options={
                "db_table": "projects",
                "ordering": ["-created_at"],
            },
        ),
    ]
