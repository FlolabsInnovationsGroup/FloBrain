import Link from "next/link";
import type { Team } from "../../types";

interface TeamCardProps {
  team: Team;
}

function getTeamInitials(name: string): string {
  const cleaned = name.replace(/^Team:?\s*/i, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return cleaned.slice(0, 2).toUpperCase() || "?";
}

export const TeamCard = ({ team }: TeamCardProps) => {
  const clampedProgress = Math.min(100, Math.max(0, team.progress));

  return (
    <Link
      href={`/leadership/teams/${team.id}`}
      className="fb-teams-card flex h-full min-h-[168px] flex-col justify-between p-4"
    >
      <div>
        <div className="mb-3 flex items-start gap-2.5">
          <div
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-xs font-medium"
            style={{
              background: "var(--fb-teams-avatar-bg)",
              color: "var(--fb-teams-avatar-text)",
            }}
            aria-hidden
          >
            {getTeamInitials(team.name)}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h2
              className="truncate text-xs font-medium leading-normal"
              style={{ color: "var(--fb-teams-heading)" }}
            >
              {team.name}
            </h2>
            <p className="text-xs font-medium leading-normal" style={{ color: "var(--fb-teams-body)" }}>
              Lead: {team.lead}
            </p>
          </div>
        </div>

        <p
          className="mb-4 line-clamp-2 min-h-[27px] text-[10px] font-medium leading-normal"
          style={{ color: "var(--fb-teams-muted)" }}
        >
          {team.description}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div
          className="flex justify-between text-[10px] font-normal leading-normal"
          style={{ color: "var(--fb-teams-meta)" }}
        >
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-[5px]"
          style={{ background: "var(--fb-teams-track)" }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedProgress}
          aria-label={`${team.name} progress`}
        >
          <div
            className="h-full rounded-[5px] border border-[#d9d9d9] transition-all duration-500"
            style={{
              width: `${clampedProgress}%`,
              background: "var(--fb-teams-success)",
            }}
          />
        </div>
        <div
          className="flex items-center justify-between text-[10px] font-normal leading-normal"
          style={{ color: "var(--fb-teams-meta)" }}
        >
          <span>
            {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
          </span>
          <span>
            {team.completedTasks}/{team.totalTasks} tasks done
          </span>
        </div>
      </div>
    </Link>
  );
};
