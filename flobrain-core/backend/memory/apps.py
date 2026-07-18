"""memory/apps.py — AppConfig with signal wiring for Neo4j graph_sync (P3.03)."""
from django.apps import AppConfig


class MemoryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "memory"
    verbose_name = "Memory graph"

    def ready(self):
        """Wire up Django signals for Neo4j graph sync."""
        try:
            from .graph_sync import connect_signals
            connect_signals()
        except ImportError:
            # graph_sync.py requires neo4j driver — skip if not installed
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"[MemoryConfig.ready] graph_sync signals failed: {e}")
