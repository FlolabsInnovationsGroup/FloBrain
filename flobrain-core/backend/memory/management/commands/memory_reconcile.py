import json

from django.core.management.base import BaseCommand

from memory.services import reconcile_memory


class Command(BaseCommand):
    help = (
        "Reconcile derived memory stores with SQL: re-index pending/failed rows, resync stale "
        "vector metadata, delete vectors without a row and, with --archive, unreferenced archive "
        "objects. Idempotent; run manually or from an operator's own scheduler."
    )

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Report what would change without changing it")
        parser.add_argument("--archive", action="store_true", help="Also delete archive objects no row points to")

    def handle(self, *args, **options):
        counts = reconcile_memory(dry_run=options["dry_run"], archive=options["archive"])
        self.stdout.write(json.dumps(counts, sort_keys=True))
