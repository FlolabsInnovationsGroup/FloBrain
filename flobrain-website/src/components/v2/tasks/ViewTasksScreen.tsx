"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import type { Task, TaskStatus } from "@/types/task";
import { CREATABLE_TASK_STATUSES } from "@/lib/tasks";
import { formatAssigneeList, formatTaskListDate, taskListStatusLabel } from "@/lib/taskDisplay";
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
 * View Tasks content from Lead Controls Figma (node 45:16 area).
 * Does not render shared Leadership nav or Create Team/Project/Task buttons.
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
      {/* Centered column: toolbar width matches table; scroll sits beside table only */}
      <div className="fb-v2-tasks-main">
        <div className="fb-v2-tasks-view-toolbar">
          <h2 className="fb-v2-tasks-view-title">TASKS: {projectLabel}</h2>
          <label className="fb-v2-tasks-filter">
            <span className="fb-v2-tasks-filter-label">Filter by</span>
            <ChevronDown
              className="fb-v2-tasks-filter-chevron"
              size={9}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <select
              aria-label="Filter tasks by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">All</option>
              {CREATABLE_TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {taskListStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="fb-v2-tasks-table-shell">
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
                        <Link
                          href={`/leadership/tasks/${task.id}`}
                          className="fb-v2-tasks-name-link"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td data-label="Created by:">{task.createdBy.name}</td>
                      <td data-label="Assigned to:">{formatAssigneeList(task.assignedTo)}</td>
                      <td data-label="STATUS">
                        <span className="fb-v2-tasks-status" data-tone={task.status}>
                          <span>{taskListStatusLabel(task.status)}</span>
                          <ChevronDown size={9} strokeWidth={2.5} aria-hidden="true" />
                        </span>
                      </td>
                      <td data-label="DUE DATE">{formatTaskListDate(task.dueDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Same height as the table panel — sibling of wrap, not the toolbar */}
          <div className="fb-v2-tasks-scroll" aria-hidden="true">
            <div className="fb-v2-tasks-scroll-track">
              <div className="fb-v2-tasks-scroll-thumb" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
