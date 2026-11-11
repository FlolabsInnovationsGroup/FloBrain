from django.core.management.base import BaseCommand
from memory.reclassification import promote_to_active_context

class Command(BaseCommand):
    help = "Promotes historical data from Tier 3 to Tier 1 based on context[cite: 1, 2]."

    def add_arguments(self, parser):
        parser.add_argument('keyword', type=str, help='Keyword to trigger memory warm-up')

    def handle(self, *args, **options):
        keyword = options['keyword']
        self.stdout.write(f"Searching The Vault for: {keyword}...")
        
        count = promote_to_active_context(keyword)
        
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f"Successfully warmed up {count} nodes."))
        else:
            self.stdout.write(self.style.WARNING("No matching historical context found in Tier 3."))