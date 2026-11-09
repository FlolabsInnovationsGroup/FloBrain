from django.contrib import admin
from .models import Team, TeamMember


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_by", "created_at"]
    search_fields = ["name"]


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ["id", "team", "user", "role", "joined_at"]
    list_filter = ["role"]