
export type Intern = {
  id: number;
  name: string;
  team: string;
  tasks: number;
  progress: number;
  status: "Active" | "Away" | "On leave";
};

type InternOverviewProps = {
  interns: Intern[];
};

export default function InternOverview({
  interns,
}: InternOverviewProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-[var(--fb-v2-heading)]">
        INTERN OVERVIEW
      </h2>

      <div className="fb-v2-card overflow-x-auto p-0">
        <table className="w-full min-w-[650px] table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--fb-v2-border)]">
              {["Intern", "Team", "Tasks", "Progress", "Status"].map(
                (heading) => (
                  <th key={heading} scope="col" className="p-4 font-medium text-[var(--fb-v2-text-muted)]">
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {interns.map((intern) => (
              <tr
                key={intern.id}
                className="border-b border-[var(--fb-v2-border)] last:border-0"
              >
                <td className="p-4">{intern.name}</td>
                <td className="p-4">{intern.team}</td>
                <td className="p-4">{intern.tasks}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--fb-v2-border)]">
                      <div
                        className="h-full rounded-full bg-[var(--fb-v2-accent)]"
                        style={{ width: `${intern.progress}%` }}
                      />
                    </div>
                    <span>{intern.progress}%</span>
                  </div>
                </td>
                <td className="p-4">{intern.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
