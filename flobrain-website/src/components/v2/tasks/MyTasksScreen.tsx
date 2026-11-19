"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import StatusBadge from "../StatusBadge";
import { taskListStatusLabel } from "@/lib/taskDisplay";
import type { Task } from "@/types/task";
import { getMockMyTasks } from "./mockMyTasks";

type FilterOption = { id: string; label: string };

type FilterSelectProps = {
  label: string;
  value: string;
  options: readonly FilterOption[];
  allLabel: string;
  onChange: (value: string) => void;
};

type MyTasksScreenProps = {
  /** When omitted, the prototype mock list is used. */
  tasks?: readonly Task[];
  /** Reference point for the relative "last accessed" labels. */
  now?: Date;
};

/** Stable colors so an assignee keeps the same circle across rows. */
const ASSIGNEE_COLORS = [
  "bg-[var(--fb-v2-accent)]",
  "bg-[var(--fb-v2-success)]",
  "bg-[var(--fb-v2-warning)]",
  "bg-[var(--fb-v2-error)]",
  "bg-[var(--fb-v2-inactive)]",
] as const;

/** Table sits one shade darker than the surrounding surface, in both themes. */
const TABLE_BG = "bg-[color-mix(in_srgb,black_10%,var(--fb-v2-surface))]";
const TABLE_RING = "ring-[color-mix(in_srgb,black_10%,var(--fb-v2-surface))]";

function FilterSelect({ label, value, options, allLabel, onChange }: FilterSelectProps) {
  return (
    <label className="relative inline-flex items-center text-[13px] text-[var(--fb-v2-text-muted)]">
      <select
        aria-label={`Filter by ${label.toLowerCase()}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[160px] appearance-none rounded-[5px] border border-[var(--fb-v2-input-border)] bg-[var(--fb-v2-input-bg)] py-1.5 pl-3 pr-8 text-[13px] text-[var(--fb-v2-text)] outline-none transition-colors hover:border-[var(--fb-v2-border)] focus-visible:border-[var(--fb-v2-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fb-v2-accent-subtle)] [&>option]:bg-[var(--fb-v2-input-bg)] [&>option]:text-[var(--fb-v2-text)]"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 text-[var(--fb-v2-text-muted)]"
        size={14}
        strokeWidth={2}
        aria-hidden="true"
      />
    </label>
  );
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return words[0]?.slice(0, 2).toUpperCase() || "?";
}

function assigneeColor(id: string): string {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return ASSIGNEE_COLORS[hash % ASSIGNEE_COLORS.length];
}

/** "Today", "Yesterday" or "N days ago", based on local calendar days. */
export function formatLastAccessed(iso: string, now: Date): string {
  const accessed = new Date(iso);
  if (Number.isNaN(accessed.getTime())) return iso;

  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(accessed)) / 86_400_000);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

/**
 * My Tasks content for the top-level /tasks route. The list is filtered by team and
 * project; the shared shell and create actions are rendered by PageStructure.
 */
export function MyTasksScreen({ tasks = getMockMyTasks(), now = new Date() }: MyTasksScreenProps) {
  const [teamFilter, setTeamFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const teamOptions = useMemo(
    () =>
      Array.from(
        new Map(
          tasks.map((task) => [task.team.id, { id: task.team.id, label: task.team.name }])
        ).values()
      ).sort((a, b) => a.label.localeCompare(b.label)),
    [tasks]
  );

  const projectOptions = useMemo(
    () =>
      Array.from(
        new Map(
          tasks.map((task) => [task.project.id, { id: task.project.id, label: task.project.name }])
        ).values()
      ).sort((a, b) => a.label.localeCompare(b.label)),
    [tasks]
  );

  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (teamFilter === "all" || task.team.id === teamFilter) &&
          (projectFilter === "all" || task.project.id === projectFilter)
      ),
    [tasks, teamFilter, projectFilter]
  );

  return (
    <main className="flex h-full w-full flex-col">
      <div className="w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-[var(--fb-v2-text-muted)]">{visibleTasks.length} tasks</p>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <FilterSelect
              label="Teams"
              allLabel="All teams"
              value={teamFilter}
              options={teamOptions}
              onChange={setTeamFilter}
            />
            <FilterSelect
              label="Projects"
              allLabel="All projects"
              value={projectFilter}
              options={projectOptions}
              onChange={setProjectFilter}
            />
          </div>
        </div>

        <div
          className={`overflow-x-auto rounded-[5px] border border-[var(--fb-v2-border)] ${TABLE_BG}`}
        >
          <table className="w-full table-fixed border-collapse text-left text-[13px]">
            <caption className="sr-only">My tasks, filtered by team and project</caption>
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[14%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead className="bg-[var(--fb-v2-surface-raised)] text-[11px] font-medium uppercase tracking-wide text-[var(--fb-v2-text-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Task
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Team
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Project
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Assignee
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Last accessed
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--fb-v2-divider)]">
              {visibleTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--fb-v2-text-muted)]">
                    No tasks match these filters.
                  </td>
                </tr>
              ) : (
                visibleTasks.map((task) => {
                  const shownAssignees = task.assignedTo.slice(0, 3);
                  const extraCount = task.assignedTo.length - shownAssignees.length;

                  return (
                    <tr
                      key={task.id}
                      className="transition-colors hover:bg-[var(--fb-v2-surface-raised)]"
                    >
                      <td className="break-words px-4 py-3 font-medium text-[var(--fb-v2-heading)]">
                        {task.title}
                      </td>
                      <td className="break-words px-4 py-3 text-[var(--fb-v2-text-muted)]">
                        {task.team.name}
                      </td>
                      <td className="break-words px-4 py-3 text-[var(--fb-v2-text-muted)]">
                        {task.project.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="-space-x-2 flex items-center">
                          {task.assignedTo.length === 0 ? (
                            <span className="text-[var(--fb-v2-text-subtle)]">—</span>
                          ) : (
                            <>
                              {shownAssignees.map((assignee) => (
                                <span
                                  key={assignee.id}
                                  title={assignee.name}
                                  aria-label={assignee.name}
                                  className={`relative flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[var(--fb-v2-on-accent)] ring-2 ${TABLE_RING} ${assigneeColor(assignee.id)}`}
                                >
                                  {getInitials(assignee.name)}
                                </span>
                              ))}
                              {extraCount > 0 ? (
                                <span
                                  title={task.assignedTo
                                    .slice(3)
                                    .map((assignee) => assignee.name)
                                    .join(", ")}
                                  aria-label={`${extraCount} more ${extraCount === 1 ? "assignee" : "assignees"}`}
                                  className={`relative flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--fb-v2-surface-raised)] text-[10px] font-semibold text-[var(--fb-v2-text-muted)] ring-2 ${TABLE_RING}`}
                                >
                                  +{extraCount}
                                </span>
                              ) : null}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--fb-v2-text-muted)]">
                        {formatLastAccessed(task.updatedAt, now)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge
                          variant={task.status}
                          label={taskListStatusLabel(task.status)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
