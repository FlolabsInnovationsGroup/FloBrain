import DataTable from "./DataTable";
import ProgressBar from "./ProgressBar";
import StatusBadge, { type StatusVariant } from "./StatusBadge";

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
  showViewAll?: boolean;
};

const statusVariants: Record<Team["status"], StatusVariant> = {
  "On track": "active",
  "At risk": "pending",
  Blocked: "blocked",
};

export default function TeamOverview({ teams, showViewAll }: TeamOverviewProps) {
  return (
    <DataTable
      title="TEAM OVERVIEW"
      headings={["Teams", "Lead", "Members", "Progress", "Status"]}
      viewAllHref={showViewAll ? "/leadership/teams" : undefined}
      viewAllLabel="View all teams"
    >
      {teams.map((team) => (
        <tr key={team.id}>
          <td>{team.name}</td>
          <td>{team.lead}</td>
          <td>{team.members}</td>
          <td>
            <ProgressBar value={team.progress} label={`${team.name} progress`} />
          </td>
          <td>
            <StatusBadge variant={statusVariants[team.status]} label={team.status} />
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
