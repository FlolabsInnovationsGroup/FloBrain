from django.urls import path
from .views import TeamListCreateView, TeamDetailView, TeamMemberView

urlpatterns = [
    path("", TeamListCreateView.as_view(), name="team-list-create"),
    path("<int:team_id>/", TeamDetailView.as_view(), name="team-detail"),
    path("<int:team_id>/members/", TeamMemberView.as_view(), name="team-members"),
    path("<int:team_id>/members/<int:user_id>/", TeamMemberView.as_view(), name="team-member-delete"),
]