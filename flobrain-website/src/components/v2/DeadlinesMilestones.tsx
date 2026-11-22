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
  showViewAll?: boolean;
};

export default function DeadlinesMilestones({ milestones, showViewAll }: DeadlinesMilestonesProps) {
  return (
    <DataTable
      title="DEADLINES / MILESTONES"
      headings={["Project Name", "Type", "Team", "Target Date"]}
      viewAllHref={showViewAll ? "/leadership/projects" : undefined}
      viewAllLabel="View all projects"
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
