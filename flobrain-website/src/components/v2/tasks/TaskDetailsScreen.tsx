"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import type { Task } from "@/types/task";
import { CollapsibleSection } from "@/components/v2/form/CollapsibleSection";
import { formatAssigneeSummary, taskStatusLabel } from "@/lib/taskDisplay";

import "./TaskViews.css";
import "./CreateTaskForm.css";

const DETAIL_SECTIONS: readonly {
  key: keyof Task["sections"];
  title: string;
}[] = [
  { key: "objective", title: "Objective" },
  { key: "context", title: "Context" },
  { key: "requirements", title: "Requirements" },
  { key: "steps", title: "Steps" },
  { key: "deliverables", title: "Deliverables" },
  { key: "acceptanceCriteria", title: "Acceptance Criteria" },
];

const PLACEHOLDER_PANELS = [
  "Progress Updates / WIP (files, progress, next steps)",
  "Team/Task Comments (feedback, questions, blockers)",
  "Related Resources (docs, specs, reports, designs)",
  "Brainwriting",
] as const;

type TaskDetailsScreenProps = {
  task: Task;
};

function sectionBody(value: string | string[]) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <p className="fb-v2-task-detail-empty">No items yet.</p>;
    return (
      <ul className="fb-v2-task-detail-list">
        {value.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (!value.trim()) return <p className="fb-v2-task-detail-empty">No content yet.</p>;
  return <p className="fb-v2-task-detail-prose">{value}</p>;
}

function sectionFilled(value: string | string[]) {
  return Array.isArray(value) ? value.length > 0 : value.trim().length > 0;
}

/**
 * Task Details content. Starts at "Back to tasks" — shared nav lives in PageStructure.
 */
export function TaskDetailsScreen({ task }: TaskDetailsScreenProps) {
  return (
    <div className="fb-v2-task-detail">
      <Link href="/leadership/tasks" className="fb-v2-task-detail-back">
        <ChevronLeft size={14} aria-hidden="true" />
        Back to tasks
      </Link>

      <h2 className="fb-v2-task-detail-title">{task.title}</h2>

      <dl className="fb-v2-task-detail-meta">
        <div>
          <dt>Assignees</dt>
          <dd>{formatAssigneeSummary(task.assignedTo)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd data-tone={task.status}>{taskStatusLabel(task.status)}</dd>
        </div>
        <div>
          <dt>Team</dt>
          <dd>{task.team.name}</dd>
        </div>
        <div>
          <dt>Project</dt>
          <dd>{task.project.name}</dd>
        </div>
      </dl>

      {task.description ? (
        <section className="fb-v2-task-detail-description" aria-label="Task description">
          <h3>Task description</h3>
          <p>{task.description}</p>
        </section>
      ) : null}

      <div className="fb-v2-task-sections fb-v2-task-detail-sections">
        {DETAIL_SECTIONS.map((section) => {
          const value = task.sections[section.key];
          return (
            <CollapsibleSection
              key={section.key}
              title={section.title}
              filled={sectionFilled(value)}
            >
              {sectionBody(value)}
            </CollapsibleSection>
          );
        })}
      </div>

      <div className="fb-v2-task-detail-panels">
        {PLACEHOLDER_PANELS.map((label) => (
          <button key={label} type="button" className="fb-v2-task-detail-panel">
            <span>{label}</span>
            <span aria-hidden="true">+</span>
          </button>
        ))}
      </div>

      <section className="fb-v2-task-detail-meeting" aria-label="Meeting details">
        <p>
          <span className="fb-v2-task-detail-meeting-label">Meeting Link:</span>{" "}
          <span className="fb-v2-task-detail-meeting-muted">Coming soon</span>
        </p>
        <p>
          <span className="fb-v2-task-detail-meeting-label">FloLabs Email:</span>{" "}
          <span className="fb-v2-task-detail-meeting-muted">Coming soon</span>
        </p>
        <p>
          <span className="fb-v2-task-detail-meeting-label">Password:</span>{" "}
          <span className="fb-v2-task-detail-meeting-muted">Coming soon</span>
        </p>
      </section>
    </div>
  );
}
