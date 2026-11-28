from django.urls import path
from .views import (
    TeamActivityView,
    TeamDetailView,
    TeamListCreateView,
    TeamMemberView,
    TeamScorecardView,
)

urlpatterns = [
    path("", TeamListCreateView.as_view(), name="team-list-create"),
    path("scorecard/", TeamScorecardView.as_view(), name="team-scorecard"),
    path("activity/", TeamActivityView.as_view(), name="team-activity"),
    path("<int:team_id>/", TeamDetailView.as_view(), name="team-detail"),
    path("<int:team_id>/members/", TeamMemberView.as_view(), name="team-members"),
    path("<int:team_id>/members/<uuid:user_id>/", TeamMemberView.as_view(), name="team-member-delete"),
]