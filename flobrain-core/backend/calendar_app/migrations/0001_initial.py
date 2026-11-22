import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("users", "0003_create_admin_role"),
    ]

    operations = [
        migrations.CreateModel(
            name="CalendarEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("date", models.DateField(db_index=True)),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="calendar_events",
                    to="users.user",
                )),
            ],
            options={
                "db_table": "calendar_events",
                "ordering": ["date", "start_time"],
            },
        ),
        migrations.CreateModel(
            name="Todo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("completed", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="todos",
                    to="users.user",
                )),
            ],
            options={
                "db_table": "todos",
                "ordering": ["completed", "-created_at"],
            },
        ),
    ]
