"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/states";
import { TeamCard } from "./components/team-card";
import { fetchTeams, v2Keys, type TeamApi } from "@/lib/v2-api";
import type { Team } from "./types";

function mapTeam(t: TeamApi): Team {
  return {
    id: String(t.id),
    name: t.name,
    lead: t.lead,
    description: t.description,
    progress: t.progress,
    memberCount: t.member_count,
    completedTasks: t.completed_tasks,
    totalTasks: t.total_tasks,
  };
}

export function TeamsOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: v2Keys.teams,
    queryFn: fetchTeams,
  });

  if (isLoading) {
    return (
      <main className="fb-teams-page h-full w-full px-[var(--fb-teams-margin)] py-6 md:py-8">
        <div className="mx-auto w-full max-w-[1200px]">
          <p className="text-sm text-center" style={{ color: "var(--fb-v2-text-muted)" }}>
            Loading teams…
          </p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="fb-teams-page h-full w-full px-[var(--fb-teams-margin)] py-6 md:py-8">
        <div className="mx-auto w-full max-w-[1200px]">
          <p className="text-sm text-center" style={{ color: "var(--fb-v2-error)" }}>
            Failed to load teams. Please try again.
          </p>
        </div>
      </main>
    );
  }

  const teams = (data ?? []).map(mapTeam);

  return (
    <main className="fb-teams-page h-full w-full px-[var(--fb-teams-margin)] py-6 md:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        {teams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teams yet"
            description="Teams you belong to will appear here once they are created."
          />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
