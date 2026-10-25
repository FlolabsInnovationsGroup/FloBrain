
export type Milestone = {
  id: number;
  projectName: string;
  type: "Milestone" | "Deadline";
  team: string;
  targetDate: string;
};

type DeadlinesMilestonesProps = {
  milestones: Milestone[];
};

export default function DeadlinesMilestones({
  milestones,
}: DeadlinesMilestonesProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-[var(--fb-v2-heading)]">
        DEADLINES / MILESTONES
      </h2>

      <div className="fb-v2-card overflow-x-auto p-0">
        <table className="w-full min-w-[650px] table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--fb-v2-border)]">
              {[
                "Project Name",
                "Type",
                "Team",
                "Target Date",
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="p-4 font-medium text-[var(--fb-v2-text-muted)]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {milestones.map((milestone) => (
              <tr
                key={milestone.id}
                className="border-b border-[var(--fb-v2-border)] last:border-0"
              >
                <td className="p-4">
                  {milestone.projectName}
                </td>

                <td className="p-4">
                  {milestone.type}
                </td>

                <td className="p-4">
                  {milestone.team}
                </td>

                <td className="p-4">
                  {milestone.targetDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
