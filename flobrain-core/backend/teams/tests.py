from django.test import SimpleTestCase

from teams.models import Team, TeamMember


class TeamModelsTest(SimpleTestCase):
    def test_models_are_available(self):
        self.assertIsNotNone(Team)
        self.assertIsNotNone(TeamMember)
