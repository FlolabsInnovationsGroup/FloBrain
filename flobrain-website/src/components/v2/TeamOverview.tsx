
export type Team = {
  id: number;
  name: string;
  lead: string;
  members: number;
  progress: number;
  status: "On track" | "At risk" | "Blocked";
};

type TeamOverviewProps = {
  teams: Team[];
};

export default function TeamOverview({
  teams,
}: TeamOverviewProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-[var(--fb-v2-heading)]">
        TEAM OVERVIEW
      </h2>

      <div className="fb-v2-card overflow-x-auto p-0">
        <table className="w-full min-w-[650px] table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--fb-v2-border)]">
              {["Teams", "Lead", "Members", "Progress", "Status"].map(
                (heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="p-4 font-medium text-[var(--fb-v2-text-muted)]"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {teams.map((team) => (
              <tr
                key={team.id}
                className="border-b border-[var(--fb-v2-border)] last:border-0"
              >
                <td className="p-4">{team.name}</td>
                <td className="p-4">{team.lead}</td>
                <td className="p-4">{team.members}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      role="progressbar"
                      aria-label={`${team.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={team.progress}
                      className="h-2 w-24 overflow-hidden rounded-full bg-[var(--fb-v2-border)]"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--fb-v2-accent)]"
                        style={{ width: `${team.progress}%` }}
                      />
                    </div>
                    <span>{team.progress}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="rounded border border-[var(--fb-v2-border)] px-2 py-1">
                    {team.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
