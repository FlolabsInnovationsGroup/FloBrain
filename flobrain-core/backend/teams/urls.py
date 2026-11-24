
from django.urls import path

from .views import (
    TeamListCreateView,
    TeamDetailView,
    TeamMemberView,
    TeamActivityListView,
    TeamScorecardView,
)

urlpatterns = [
    path("", TeamListCreateView.as_view(), name="team-list-create"),
    path("activity/", TeamActivityListView.as_view(), name="team-activity"),
    path("scorecard/", TeamScorecardView.as_view(), name="team-scorecard"),
    path("<int:team_id>/", TeamDetailView.as_view(), name="team-detail"),
    path("<int:team_id>/members/", TeamMemberView.as_view(), name="team-members"),
    path(
        "<int:team_id>/members/<uuid:user_id>/",
        TeamMemberView.as_view(),
        name="team-member-delete",
    ),
]
