from django.contrib import admin
from .models import TokenUsageRecord, UserPlanQuota, UserUsageSummary

admin.site.register(UserPlanQuota)
admin.site.register(TokenUsageRecord)
admin.site.register(UserUsageSummary)
