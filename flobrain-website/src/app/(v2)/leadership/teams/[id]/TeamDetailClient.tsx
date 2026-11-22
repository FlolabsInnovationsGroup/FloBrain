"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { fetchTeam, v2Keys, type TeamDetailApi } from "@/lib/v2-api";
import { TeamDetails } from "../team-details";
import type { TeamDetail, TeamProject } from "../types";
import type { Team } from "../types";

function mapTeamDetail(t: TeamDetailApi): TeamDetail {
  const base: Team = {
    id: String(t.id),
    name: t.name,
    lead: t.lead,
    description: t.description,
    progress: t.progress,
    memberCount: t.member_count,
    completedTasks: t.completed_tasks,
    totalTasks: t.total_tasks,
  };

  const projects: TeamProject[] = (t.projects ?? []).map((p) => ({
    id: String(p.id),
    name: p.name,
    activeTasks: p.active_tasks,
    closedTasks: p.closed_tasks,
    activeInterns: p.active_interns,
    progress: p.progress,
  }));

  return {
    ...base,
    blockers: t.blockers,
    activeProjects: t.active_projects,
    activeInterns: t.active_interns,
    projects,
  };
}

export function TeamDetailClient({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: v2Keys.team(id),
    queryFn: () => fetchTeam(id),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <p className="text-sm" style={{ color: "var(--fb-v2-text-muted)" }}>
          Loading team…
        </p>
      </div>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) notFound();
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <p className="text-sm" style={{ color: "var(--fb-v2-error)" }}>
          Failed to load team details.
        </p>
      </div>
    );
  }

  if (!data) return null;

  return <TeamDetails team={mapTeamDetail(data)} />;
}
