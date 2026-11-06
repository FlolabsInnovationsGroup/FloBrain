"use client";

import DashboardOverview from "./DashboardOverview";
import { useLeadershipSearch } from "./LeadershipSearchContext";
import {
  initialInterns,
  initialMilestones,
  initialTeams,
  type DemoTask,
} from "./dashboardMockData";

const noTasks: DemoTask[] = [];

/** Dashboard content for the V2 shell. The shared toolbar owns create links and search. */
export default function LeadershipDashboardPanel() {
  const { query, resultsRef } = useLeadershipSearch();

  return (
    <div className="fb-v2-dashboard">
      <p className="text-xs text-[var(--fb-v2-text-muted)]">
        Demo mode: This page shows mock data.
      </p>

      <DashboardOverview
        ref={resultsRef}
        teams={initialTeams}
        interns={initialInterns}
        milestones={initialMilestones}
        tasks={noTasks}
        createdProjects={0}
        search={query}
      />
    </div>
  );
}
