"use client";

import { useQuery } from "@tanstack/react-query";
import DashboardOverview from "./DashboardOverview";
import { useLeadershipSearch } from "./LeadershipSearchContext";
import {
  initialMilestones,
  type DemoTask,
} from "./dashboardMockData";
import { fetchTeams, fetchInterns, fetchProjects, formatIsoDate, v2Keys } from "@/lib/v2-api";
import type { Team } from "./TeamOverview";
import type { Intern } from "./InternOverview";
import type { Milestone } from "./DeadlinesMilestones";

const noTasks: DemoTask[] = [];

function teamStatus(progress: number): "On track" | "At risk" | "Blocked" {
  if (progress >= 70) return "On track";
  if (progress >= 40) return "At risk";
  return "Blocked";
}

function internStatus(hours: number): "Active" | "Away" | "On leave" {
  return hours > 0 ? "Active" : "Away";
}

/** Dashboard content for the V2 shell. The shared toolbar owns create links and search. */
export default function LeadershipDashboardPanel() {
  const { query, resultsRef } = useLeadershipSearch();

  const { data: teamsData } = useQuery({ queryKey: v2Keys.teams, queryFn: fetchTeams });
  const { data: internsData } = useQuery({ queryKey: v2Keys.interns, queryFn: fetchInterns });
  const { data: projectsData } = useQuery({ queryKey: v2Keys.projects, queryFn: fetchProjects });

  const teams: Team[] = (teamsData ?? []).map((t, i) => ({
    id: i + 1,
    name: t.name,
    lead: t.lead,
    members: t.member_count,
    progress: t.progress,
    status: teamStatus(t.progress),
  }));

  const interns: Intern[] = (internsData ?? []).map((intern, i) => ({
    id: i + 1,
    name: intern.name,
    team: intern.team,
    tasks: 0,
    progress: Math.min(100, Math.round((intern.hours / 40) * 100)),
    status: internStatus(intern.hours),
  }));

  const milestones: Milestone[] = projectsData
    ? projectsData
        .filter((p) => p.target_date !== null)
        .map((p, i) => ({
          id: i + 1,
          projectName: p.name,
          type: "Deadline" as const,
          team: p.team,
          targetDate: formatIsoDate(p.target_date),
        }))
    : initialMilestones;

  return (
    <div className="fb-v2-dashboard">
      <DashboardOverview
        ref={resultsRef}
        teams={teams}
        interns={interns}
        milestones={milestones}
        tasks={noTasks}
        createdProjects={projectsData?.length ?? 0}
        search={query}
        showViewAll
      />
    </div>
  );
}
