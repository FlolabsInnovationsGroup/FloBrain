"""flobrain/celery.py — Celery configuration with beat schedule for GC tasks."""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "flobrain.settings")

app = Celery("flobrain")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Beat schedule: GC deep-freeze daily at 03:00, token purge weekly on Sunday
app.conf.beat_schedule = {
    "gc-deep-freeze-daily": {
        "task": "flobrain.memory.task_gc_deep_freeze",
        "schedule": crontab(hour=3, minute=0),
    },
    "gc-purge-stale-tokens-weekly": {
        "task": "flobrain.memory.task_gc_purge_stale_tokens",
        "schedule": crontab(hour=4, minute=0, day_of_week=0),
    },
    "hebbian-learning-30min": {
        "task": "flobrain.memory.task_apply_hebbian_learning",
        "schedule": crontab(minute="*/30"),
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
