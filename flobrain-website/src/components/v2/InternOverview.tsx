import DataTable from "./DataTable";
import ProgressBar from "./ProgressBar";
import StatusBadge, { type StatusVariant } from "./StatusBadge";

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

const statusVariants: Record<Intern["status"], StatusVariant> = {
  Active: "active",
  Away: "inactive",
  "On leave": "inactive",
};

export default function InternOverview({ interns }: InternOverviewProps) {
  return (
    <DataTable title="INTERN OVERVIEW" headings={["Intern", "Team", "Tasks", "Progress", "Status"]}>
      {interns.map((intern) => (
        <tr key={intern.id}>
          <td>{intern.name}</td>
          <td>{intern.team}</td>
          <td>{intern.tasks}</td>
          <td>
            <ProgressBar value={intern.progress} label={`${intern.name} progress`} />
          </td>
          <td>
            <StatusBadge variant={statusVariants[intern.status]} label={intern.status} />
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
