"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import type { Task, TaskStatus } from "@/types/task";
import { CREATABLE_TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/tasks";
import { formatAssigneeList, formatTaskListDate, taskStatusLabel } from "@/lib/taskDisplay";
import { getMockTasks } from "./mockTasks";

import "./TaskViews.css";

type StatusFilter = "all" | TaskStatus;

type ViewTasksScreenProps = {
  /** When omitted, the prototype mock list is used. */
  tasks?: readonly Task[];
  /** Shown in the "TASKS: …" heading. */
  projectLabel?: string;
};

/**
 * Leadership View Tasks table content from the Figma frame (no shared nav/CTAs).
 */
export function ViewTasksScreen({
  tasks = getMockTasks(),
  projectLabel = "FLOHEALTH",
}: ViewTasksScreenProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const visible = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  return (
    <div className="fb-v2-tasks-view">
      <div className="fb-v2-tasks-view-toolbar">
        <h2 className="fb-v2-tasks-view-title">TASKS: {projectLabel}</h2>
        <label className="fb-v2-tasks-filter">
          <span className="fb-v2-tasks-filter-label">Filter by</span>
          <span className="fb-v2-tasks-filter-control">
            <select
              aria-label="Filter tasks by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">All</option>
              {CREATABLE_TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <ChevronDown size={12} aria-hidden="true" />
          </span>
        </label>
      </div>

      <div className="fb-v2-tasks-table-wrap">
        <table className="fb-v2-tasks-table">
          <caption className="sr-only">Tasks for {projectLabel}</caption>
          <colgroup>
            <col className="fb-v2-tasks-col-task" />
            <col className="fb-v2-tasks-col-created" />
            <col className="fb-v2-tasks-col-assigned" />
            <col className="fb-v2-tasks-col-status" />
            <col className="fb-v2-tasks-col-due" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">TASK</th>
              <th scope="col">Created by:</th>
              <th scope="col">Assigned to:</th>
              <th scope="col">STATUS</th>
              <th scope="col">DUE DATE</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="fb-v2-tasks-empty">
                  No tasks match this filter.
                </td>
              </tr>
            ) : (
              visible.map((task) => (
                <tr key={task.id}>
                  <td data-label="TASK">
                    <Link href={`/leadership/tasks/${task.id}`} className="fb-v2-tasks-name-link">
                      {task.title}
                    </Link>
                  </td>
                  <td data-label="Created by:">{task.createdBy.name}</td>
                  <td data-label="Assigned to:">{formatAssigneeList(task.assignedTo)}</td>
                  <td data-label="STATUS">
                    <span className="fb-v2-tasks-status" data-tone={task.status}>
                      <span>{taskStatusLabel(task.status)}</span>
                      <ChevronDown size={10} aria-hidden="true" />
                    </span>
                  </td>
                  <td data-label="DUE DATE">{formatTaskListDate(task.dueDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
