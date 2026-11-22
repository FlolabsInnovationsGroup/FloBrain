"use client";

import { useRef, useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import DashboardOverview, { type DashboardResultsHandle } from "./DashboardOverview";
import PageHeader from "./PageHeader";
import type { Team } from "./TeamOverview";
import type { Intern } from "./InternOverview";
import type { Milestone } from "./DeadlinesMilestones";
import {
  initialInterns,
  initialMilestones,
  initialTeams,
  type DemoTask,
} from "./dashboardMockData";

type CreateMode = "team" | "project" | "task";

const emptyForm = {
  name: "",
  lead: "",
  team: "",
  targetDate: "",
  project: "",
  assignee: "",
};

export default function LeadershipDashboard() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [interns, setInterns] = useState<Intern[]>(initialInterns);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [tasks, setTasks] = useState<DemoTask[]>([]);
  const [createdProjects, setCreatedProjects] = useState(0);

  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<CreateMode | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  const resultsRef = useRef<DashboardResultsHandle>(null);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openCreate(nextMode: CreateMode) {
    setMode(nextMode);
    setForm({ ...emptyForm });
    setError("");
    dialogRef.current?.showModal();
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name || !mode) {
      setError("Please enter a valid name.");
      return;
    }

    if (mode === "team") {
      if (teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) {
        setError("This team already exists.");
        return;
      }

      setTeams((previous) => [
        ...previous,
        {
          id: Date.now(),
          name,
          lead: form.lead.trim(),
          members: 0,
          progress: 0,
          status: "On track",
        },
      ]);

      setNotice(`Team "${name}" created in the preview.`);
    }

    if (mode === "project") {
      if (milestones.some((item) => item.projectName.toLowerCase() === name.toLowerCase())) {
        setError("This project already exists.");
        return;
      }

      const formattedDate = new Date(`${form.targetDate}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      setMilestones((previous) => [
        ...previous,
        {
          id: Date.now(),
          projectName: name,
          type: "Deadline",
          team: form.team,
          targetDate: formattedDate,
        },
      ]);

      setCreatedProjects((previous) => previous + 1);
      setNotice(`Project "${name}" created in the preview.`);
    }

    if (mode === "task") {
      setTasks((previous) => [
        ...previous,
        {
          id: Date.now(),
          name,
          project: form.project,
          assignee: form.assignee,
        },
      ]);

      setInterns((previous) =>
        previous.map((intern) =>
          intern.name === form.assignee ? { ...intern, tasks: intern.tasks + 1 } : intern
        )
      );

      setNotice(`Task "${name}" created as pending in the preview.`);
    }

    dialogRef.current?.close();
  }

  return (
    <main className="fb-v2-content">
      <div className="fb-v2-lead-panel">
        <PageHeader title="Leadership Dashboard" />

        {/* ACTION BUTTONS AND SEARCH */}
        <div className="fb-v2-toolbar">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="fb-v2-btn-primary" onClick={() => openCreate("team")}>
              Create Team
            </button>

            <button
              type="button"
              className="fb-v2-btn-primary"
              onClick={() => openCreate("project")}
            >
              Create Project
            </button>

            <button type="button" className="fb-v2-btn-primary" onClick={() => openCreate("task")}>
              Create Task
            </button>
          </div>

          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              resultsRef.current?.jumpToMatch();
            }}
            className="w-full sm:w-[234px]"
          >
            <div className="fb-v2-search">
              <button
                type="submit"
                aria-label="Jump to search result"
                title="Jump to search result"
                className="fb-v2-search-submit"
              >
                <Search size={16} />
              </button>

              <label htmlFor="leadership-search" className="sr-only">
                Search by name
              </label>

              <input
                id="leadership-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name"
                className="fb-v2-search-input"
              />
            </div>
          </form>
        </div>

        <p className="text-xs text-[var(--fb-v2-text-muted)]">
          Demo mode: Changes use mock data and reset when you refresh.
        </p>

        {notice && (
          <p role="status" className="text-sm text-[var(--fb-v2-accent)]">
            {notice}
          </p>
        )}

        <DashboardOverview
          ref={resultsRef}
          teams={teams}
          interns={interns}
          milestones={milestones}
          tasks={tasks}
          createdProjects={createdProjects}
          search={search}
        />
      </div>

      {/* REUSABLE CREATE DIALOG */}
      <dialog
        ref={dialogRef}
        onClose={() => setMode(null)}
        aria-labelledby="create-dialog-title"
        className="fb-v2-dialog"
      >
        {mode && (
          <form onSubmit={handleCreate} className="space-y-5">
            <h2
              id="create-dialog-title"
              className="text-lg font-semibold text-[var(--fb-v2-heading)]"
            >
              {mode === "team"
                ? "Create Team"
                : mode === "project"
                  ? "Create Project"
                  : "Create Task"}
            </h2>

            <div>
              <label htmlFor="create-name" className="fb-v2-label">
                {mode === "team" ? "Team name" : mode === "project" ? "Project name" : "Task title"}
              </label>
              <input
                id="create-name"
                className="fb-v2-input"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
                maxLength={80}
              />
            </div>

            {mode === "team" && (
              <div>
                <label htmlFor="create-lead" className="fb-v2-label">
                  Team lead
                </label>
                <input
                  id="create-lead"
                  className="fb-v2-input"
                  value={form.lead}
                  onChange={(event) => updateField("lead", event.target.value)}
                  required
                />
              </div>
            )}

            {mode === "project" && (
              <>
                <div>
                  <label htmlFor="create-team" className="fb-v2-label">
                    Team
                  </label>
                  <select
                    id="create-team"
                    className="fb-v2-input"
                    value={form.team}
                    onChange={(event) => updateField("team", event.target.value)}
                    required
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="create-date" className="fb-v2-label">
                    Target date
                  </label>
                  <input
                    id="create-date"
                    type="date"
                    className="fb-v2-input"
                    value={form.targetDate}
                    onChange={(event) => updateField("targetDate", event.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {mode === "task" && (
              <>
                <div>
                  <label htmlFor="create-project" className="fb-v2-label">
                    Project
                  </label>
                  <select
                    id="create-project"
                    className="fb-v2-input"
                    value={form.project}
                    onChange={(event) => updateField("project", event.target.value)}
                    required
                  >
                    <option value="">Select project</option>
                    {milestones.map((item) => (
                      <option key={item.id} value={item.projectName}>
                        {item.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="create-assignee" className="fb-v2-label">
                    Assigned intern
                  </label>
                  <select
                    id="create-assignee"
                    className="fb-v2-input"
                    value={form.assignee}
                    onChange={(event) => updateField("assignee", event.target.value)}
                    required
                  >
                    <option value="">Select intern</option>
                    {interns.map((intern) => (
                      <option key={intern.id} value={intern.name}>
                        {intern.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {error && (
              <p role="alert" className="text-sm text-[var(--fb-v2-error)]">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                className="fb-v2-btn-ghost"
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </button>
              <button type="submit" className="fb-v2-btn-primary">
                Create
              </button>
            </div>
          </form>
        )}
      </dialog>
    </main>
  );
}
