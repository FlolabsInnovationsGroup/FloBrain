import { Users } from "lucide-react";
import { EmptyState } from "@/components/states";
import { TeamCard } from "./components/team-card";
import { mockTeams } from "./mockData";

export function TeamsOverview() {
  return (
    <main className="fb-teams-page min-h-screen px-[var(--fb-v2-margin)] py-8 pb-24 md:py-12">
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
