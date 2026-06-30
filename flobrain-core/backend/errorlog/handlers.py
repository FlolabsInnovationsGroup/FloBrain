import logging
from .models import ErrorLog

class DatabaseLogHandler(logging.Handler):
    def emit(self, record):
        try:
            ErrorLog.objects.create(
                level="error" if record.levelno >= logging.ERROR else "warning",
                message=self.format(record),
                source=record.name,
            )
        except Exception:
            pass  # logging must never break the request