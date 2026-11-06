"use client";

import { useImperativeHandle, useRef, type Ref } from "react";

import MetricCard from "./MetricCard";
import StatusBadge from "./StatusBadge";
import TeamOverview, { type Team } from "./TeamOverview";
import InternOverview, { type Intern } from "./InternOverview";
import DeadlinesMilestones, { type Milestone } from "./DeadlinesMilestones";
import type { DemoTask } from "./dashboardMockData";

export type DashboardResultsHandle = {
  jumpToMatch: () => void;
};

type DashboardOverviewProps = {
  teams: Team[];
  interns: Intern[];
  milestones: Milestone[];
  tasks: DemoTask[];
  createdProjects: number;
  search: string;
  ref?: Ref<DashboardResultsHandle>;
};

/**
 * KPI cards, overview tables and search results, shared by /leadership/dashboard
 * and /leadership-preview. Returns a fragment so each parent controls the layout.
 */
export default function DashboardOverview({
  teams,
  interns,
  milestones,
  tasks,
  createdProjects,
  search,
  ref,
}: DashboardOverviewProps) {
  const teamResultRef = useRef<HTMLDivElement>(null);
  const internResultRef = useRef<HTMLDivElement>(null);
  const milestoneResultRef = useRef<HTMLDivElement>(null);
  const taskResultRef = useRef<HTMLElement>(null);

  const query = search.trim().toLowerCase();
  const matches = (value: string) => value.toLowerCase().includes(query);

  const visibleTeams = teams.filter(
    (team) => matches(team.name) || matches(team.lead) || matches(team.status)
  );

  const visibleInterns = interns.filter(
    (intern) => matches(intern.name) || matches(intern.team) || matches(intern.status)
  );

  const visibleMilestones = milestones.filter(
    (item) =>
      matches(item.projectName) ||
      matches(item.team) ||
      matches(item.type) ||
      matches(item.targetDate)
  );

  const visibleTasks = tasks.filter(
    (task) => matches(task.name) || matches(task.project) || matches(task.assignee)
  );

  function jumpToMatch() {
    if (!query) return;

    let target: HTMLElement | null = null;

    if (visibleTeams.length > 0) {
      target = teamResultRef.current;
    } else if (visibleInterns.length > 0) {
      target = internResultRef.current;
    } else if (visibleMilestones.length > 0) {
      target = milestoneResultRef.current;
    } else if (visibleTasks.length > 0) {
      target = taskResultRef.current;
    }

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  useImperativeHandle(ref, () => ({ jumpToMatch }));

  const highlightClass = query
    ? "scroll-mt-4 rounded-lg ring-2 ring-[var(--fb-v2-accent)] ring-offset-4 ring-offset-[var(--fb-v2-page-bg)]"
    : "scroll-mt-4";

  const noResults =
    query.length > 0 &&
    visibleTeams.length === 0 &&
    visibleInterns.length === 0 &&
    visibleMilestones.length === 0 &&
    visibleTasks.length === 0;

  const metrics = [
    { label: "Total Interns", value: 24 },
    { label: "Active Projects", value: 8 + createdProjects },
    { label: "Tasks Completed This Week", value: 37 },
    { label: "Pending Tasks", value: 12 + tasks.length },
    { label: "Project Blockers", value: 3 },
  ];

  return (
    <>
      {noResults && (
        <p role="status" className="text-sm text-[var(--fb-v2-text-muted)]">
          No matches found for &quot;{search}&quot;.
        </p>
      )}

      {/* KPI CARDS */}
      <div className="fb-v2-metrics">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      {(!query || visibleTeams.length > 0) && (
        <div ref={teamResultRef} className={highlightClass}>
          <TeamOverview teams={visibleTeams} />
        </div>
      )}

      {(!query || visibleInterns.length > 0) && (
        <div ref={internResultRef} className={highlightClass}>
          <InternOverview interns={visibleInterns} />
        </div>
      )}

      {(!query || visibleMilestones.length > 0) && (
        <div ref={milestoneResultRef} className={highlightClass}>
          <DeadlinesMilestones milestones={visibleMilestones} />
        </div>
      )}

      {/* SHOW NEWLY CREATED TASKS */}
      {visibleTasks.length > 0 && (
        <section ref={taskResultRef} className={highlightClass}>
          <h2 className="fb-v2-section-title">NEW TASKS</h2>
          <div className="fb-v2-card space-y-3">
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--fb-v2-border)] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{task.name}</p>
                  <p className="text-xs text-[var(--fb-v2-text-muted)]">
                    {task.project} | Assigned to {task.assignee}
                  </p>
                </div>
                <StatusBadge variant="pending" label="Pending" />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
