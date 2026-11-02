"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { Task } from "@/types/task";
import { CollapsibleSection } from "@/components/v2/form/CollapsibleSection";
import { formatAssigneeSummary, taskListStatusLabel } from "@/lib/taskDisplay";

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

/** Figma collaboration rows — placeholders until backend exists. */
const PLACEHOLDER_PANELS = [
  {
    title: "Progress Updates / WIP",
    hint: "(files, progress, next steps)",
  },
  {
    title: "Team/Task Comments",
    hint: "(feedback, questions, blockers)",
  },
  {
    title: "Related Resources",
    hint: "(docs, specs, reports, designs)",
  },
  {
    title: "Brainwriting",
    hint: null,
  },
] as const;

/** Prototype meeting block from Lead Controls Figma (node 47:204). */
const MEETING_DETAILS = {
  linkLabel: "Zoom Login",
  email: "zoom.buddy@flolabsinnovations.com",
  password: "7Usd4VR!2",
} as const;

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

function BackToTasksLink() {
  return (
    <Link href="/leadership/tasks" className="fb-v2-task-detail-back">
      <ChevronLeft size={12} strokeWidth={2.5} aria-hidden="true" />
      Back to tasks
    </Link>
  );
}

/**
 * Task Details template from Lead Controls Figma (node 47:207).
 * "Back to tasks" targets the shared create-CTA band (`[data-slot="actions"]`) when
 * the shared layout is present — without editing shared components — so merge keeps
 * the same place as Create Team/Project/Task. Falls back inline when that slot is absent.
 */
export function TaskDetailsScreen({ task }: TaskDetailsScreenProps) {
  const [actionsSlot, setActionsSlot] = useState<Element | null>(null);

  useEffect(() => {
    // Defer setState to avoid synchronous setState in effect (react-hooks/set-state-in-effect)
    queueMicrotask(() => {
      setActionsSlot(document.querySelector('[data-slot="actions"]'));
    });
  }, []);

  const backLink = <BackToTasksLink />;

  return (
    <div className="fb-v2-task-detail" data-fb-v2-task-detail="">
      {actionsSlot ? createPortal(backLink, actionsSlot) : backLink}

      <div className="fb-v2-task-detail-row">
        <div className="fb-v2-task-detail-lead">
          <div className="fb-v2-task-detail-main">
            <h2 className="fb-v2-task-detail-title">{task.title}</h2>

            <dl className="fb-v2-task-detail-meta">
              <div>
                <dt>Assignees:</dt>
                <dd>{formatAssigneeSummary(task.assignedTo)}</dd>
              </div>
              <div>
                <dt>Status:</dt>
                <dd data-tone={task.status}>{taskListStatusLabel(task.status)}</dd>
              </div>
              <div>
                <dt>Team:</dt>
                <dd>{task.team.name}</dd>
              </div>
              <div>
                <dt>Project</dt>
                <dd>{task.project.name}</dd>
              </div>
            </dl>

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
              {PLACEHOLDER_PANELS.map((panel) => (
                <button
                  key={panel.title}
                  type="button"
                  className="fb-v2-task-detail-panel"
                  aria-label={panel.hint ? `${panel.title} ${panel.hint}` : panel.title}
                >
                  <span className="fb-v2-task-detail-panel-label">
                    <span className="fb-v2-task-detail-panel-title">{panel.title}</span>
                    {panel.hint ? (
                      <span className="fb-v2-task-detail-panel-hint"> {panel.hint}</span>
                    ) : null}
                  </span>
                  <span className="fb-v2-task-detail-panel-add" aria-hidden="true">
                    +
                  </span>
                </button>
              ))}
            </div>

            <section className="fb-v2-task-detail-meeting" aria-label="Meeting details">
              <p>
                <span className="fb-v2-task-detail-meeting-label">Meeting Link:</span>{" "}
                <span className="fb-v2-task-detail-meeting-value">{MEETING_DETAILS.linkLabel}</span>
              </p>
              <p>
                <span className="fb-v2-task-detail-meeting-label">FloLabs Email:</span>{" "}
                <span className="fb-v2-task-detail-meeting-value">{MEETING_DETAILS.email}</span>
              </p>
              <p>
                <span className="fb-v2-task-detail-meeting-label">Password:</span>{" "}
                <span className="fb-v2-task-detail-meeting-value">{MEETING_DETAILS.password}</span>
              </p>
            </section>
          </div>
        </div>

        {/* Scroll axis outside the lead box */}
        <div className="fb-v2-task-detail-scroll" aria-hidden="true">
          <div className="fb-v2-task-detail-scroll-track">
            <div className="fb-v2-task-detail-scroll-thumb" />
          </div>
        </div>
      </div>
    </div>
  );
}
