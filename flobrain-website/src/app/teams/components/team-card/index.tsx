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
      href={`/teams/${team.id}`}
      className="fb-teams-card flex h-full flex-col justify-between p-6"
    >
      <div>
        <div className="mb-4 flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            style={{
              background: "var(--fb-v2-avatar-bg)",
              color: "var(--fb-v2-avatar-text)",
            }}
            aria-hidden
          >
            {getTeamInitials(team.name)}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h2
              className="truncate text-base font-semibold leading-snug"
              style={{ color: "var(--fb-v2-heading)" }}
            >
              {team.name}
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--fb-v2-muted)" }}>
              Lead:{" "}
              <span className="font-medium" style={{ color: "var(--fb-v2-body)" }}>
                {team.lead}
              </span>
            </p>
          </div>
        </div>

        <p
          className="mb-6 line-clamp-2 min-h-[40px] text-sm leading-relaxed"
          style={{ color: "var(--fb-v2-muted)" }}
        >
          {team.description}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <div
            className="mb-2 flex justify-between text-sm"
            style={{ color: "var(--fb-v2-muted)" }}
          >
            <span>Progress</span>
            <span className="font-medium" style={{ color: "var(--fb-v2-heading)" }}>
              {clampedProgress}%
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--fb-v2-track)" }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedProgress}
            aria-label={`${team.name} progress`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${clampedProgress}%`,
                background: "var(--fb-v2-success)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs" style={{ color: "var(--fb-v2-muted)" }}>
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
