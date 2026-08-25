from django.contrib import admin

from .models import AIModel


@admin.register(AIModel)
class AIModelAdmin(admin.ModelAdmin):
    list_display = ("name", "provider_name", "provider_type", "updated_at")
    list_filter = ("provider_type",)
    search_fields = ("name", "provider_name", "capabilities")
