import { Users } from "lucide-react";
import { EmptyState } from "@/components/states";
import { TeamCard } from "./components/team-card";
import { mockTeams } from "./mockData";

export function TeamsOverview() {
  return (
    <main className="fb-teams-page h-full w-full px-[var(--fb-teams-margin)] py-6 md:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        {mockTeams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teams yet"
            description="Teams you belong to will appear here once they are created."
          />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
