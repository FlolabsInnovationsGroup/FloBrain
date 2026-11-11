"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import LeadershipShell from "@/components/layout/leadershipShell";

type Project = {
  id: number;
  name: string;
  teamLead: string;
  team: string;
  interns: number;
  /** Milestones reached out of `milestones` */
  completedMilestones: number;
  milestones: number;
  /** Open blockers; zero means the project is on track */
  blockers: number;
  targetDate: string;
};

type StatusFilter = "All" | "On Track" | "Blocked";

const projects: Project[] = [
  {
    id: 1,
    name: "FloHealth",
    teamLead: "Mohamed",
    team: "UX/UI Design",
    interns: 12,
    completedMilestones: 6,
    milestones: 7,
    blockers: 0,
    targetDate: "Nov. 2026",
  },
  {
    id: 2,
    name: "FloBrain",
    teamLead: "Ceren",
    team: "UX/UI Design",
    interns: 9,
    completedMilestones: 5,
    milestones: 7,
    blockers: 3,
    targetDate: "Aug. 2026",
  },
];

const statusFilters: StatusFilter[] = ["All", "On Track", "Blocked"];

const columns = [
  "PROJECT",
  "TEAM LEAD",
  "TEAM",
  "INTERNS",
  "PROGRESS MILESTONES",
  "STATUS",
  "TARGET DATE",
];

/** Empty rows keep the grid filled down to the bottom of the table, as in the design */
const MIN_TABLE_ROWS = 8;

function MilestoneProgress({ completed, total }: { completed: number; total: number }) {
  const percent = Math.round((completed / total) * 100);

  return (
    <div
      role="progressbar"
      aria-label={`${completed} of ${total} milestones`}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      className="fb-lead-progress relative h-1 w-full min-w-24 rounded-full"
    >
      <div className="fb-lead-progress-fill h-full rounded-full" style={{ width: `${percent}%` }} />
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden
          className="absolute top-1/2 h-2 w-0.5 -translate-y-1/2 rounded-full bg-[#d9d9d9]"
          style={{ left: `calc(${((index + 1) / total) * 100}% - 1px)` }}
        />
      ))}
    </div>
  );
}

function ProjectStatus({ blockers }: { blockers: number }) {
  if (blockers === 0) {
    return <span className="fb-lead-status-ok font-semibold">ON TRACK</span>;
  }

  return (
    <span className="fb-lead-status-warn">
      {blockers} {blockers === 1 ? "Blocker" : "Blockers"}
    </span>
  );
}

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        ({ blockers }) =>
          statusFilter === "All" || (statusFilter === "On Track" ? blockers === 0 : blockers > 0)
      ),
    [statusFilter]
  );

  const emptyRows = Math.max(0, MIN_TABLE_ROWS - filteredProjects.length);

  return (
    <LeadershipShell>
      <div className="flex shrink-0 items-center justify-between gap-4 px-6 py-2">
        <h1 className="text-xs font-medium sm:text-sm">PROJECTS</h1>

        <label className="relative flex items-center text-[11px]">
          <span className="sr-only">Filter projects by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="fb-lead-select cursor-pointer appearance-none bg-transparent py-1 pl-2 pr-7 outline-none"
          >
            {statusFilters.map((filter) => (
              <option key={filter} value={filter}>
                {filter === "All" ? "Filter by" : filter}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-1 opacity-80" />
        </label>
      </div>

      <div className="fb-lead-scroll mr-2 min-h-0 flex-1 overflow-auto pb-4 pl-5 pr-4">
        <table className="fb-lead-table w-full min-w-170 border-collapse text-left text-[10px]">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className="px-2.5 py-2.5 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td className="px-2.5 py-1.5">{project.name}</td>
                <td className="px-2.5 py-1.5">{project.teamLead}</td>
                <td className="px-2.5 py-1.5">{project.team}</td>
                <td className="px-2.5 py-1.5 tabular-nums">{project.interns}</td>
                <td className="w-1/4 px-3 py-1.5">
                  <MilestoneProgress
                    completed={project.completedMilestones}
                    total={project.milestones}
                  />
                </td>
                <td className="px-2.5 py-1.5">
                  <ProjectStatus blockers={project.blockers} />
                </td>
                <td className="px-2.5 py-1.5">{project.targetDate}</td>
              </tr>
            ))}
            {Array.from({ length: emptyRows }, (_, index) => (
              <tr key={`empty-${index}`} aria-hidden className="h-5">
                {columns.map((column) => (
                  <td key={column} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProjects.length === 0 && (
          <p className="fb-lead-muted py-6 text-center text-sm">No projects match this filter.</p>
        )}
      </div>
    </LeadershipShell>
  );
}
