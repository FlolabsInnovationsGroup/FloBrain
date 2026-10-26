import DataTable from "./DataTable";

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

export default function DeadlinesMilestones({ milestones }: DeadlinesMilestonesProps) {
  return (
    <DataTable
      title="DEADLINES / MILESTONES"
      headings={["Project Name", "Type", "Team", "Target Date"]}
    >
      {milestones.map((milestone) => (
        <tr key={milestone.id}>
          <td>{milestone.projectName}</td>
          <td>{milestone.type}</td>
          <td>{milestone.team}</td>
          <td>{milestone.targetDate}</td>
        </tr>
      ))}
    </DataTable>
  );
}
