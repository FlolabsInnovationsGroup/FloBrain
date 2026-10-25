
"use client";

import { useRef, useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import MetricCard from "./MetricCard";
import TeamOverview, { type Team } from "./TeamOverview";
import InternOverview, { type Intern } from "./InternOverview";
import DeadlinesMilestones, { type Milestone } from "./DeadlinesMilestones";

type CreateMode = "team" | "project" | "task";

type DemoTask = {
  id: number;
  name: string;
  project: string;
  assignee: string;
};

const initialTeams: Team[] = [
  { id: 1, name: "Frontend", lead: "Maria", members: 6, progress: 75, status: "On track" },
  { id: 2, name: "Backend", lead: "Ofon", members: 8, progress: 60, status: "At risk" },
  { id: 3, name: "Design", lead: "Ceren", members: 4, progress: 90, status: "On track" },
];

const initialInterns: Intern[] = [
  { id: 1, name: "Demo Intern A", team: "Frontend", tasks: 4, progress: 70, status: "Active" },
  { id: 2, name: "Demo Intern B", team: "Backend", tasks: 3, progress: 45, status: "Away" },
  { id: 3, name: "Demo Intern C", team: "Design", tasks: 5, progress: 90, status: "Active" },
];

const initialMilestones: Milestone[] = [
  { id: 1, projectName: "FloBrain V2 Dashboard", type: "Milestone", team: "Frontend", targetDate: "Oct 28, 2026" },
  { id: 2, projectName: "User Authentication", type: "Deadline", team: "Backend", targetDate: "Nov 2, 2026" },
  { id: 3, projectName: "UI Design Review", type: "Milestone", team: "Design", targetDate: "Nov 5, 2026" },
];

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

  const teamResultRef = useRef<HTMLDivElement>(null);
  const internResultRef = useRef<HTMLDivElement>(null);
  const milestoneResultRef = useRef<HTMLDivElement>(null);
  const taskResultRef = useRef<HTMLElement>(null);

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

      const formattedDate = new Date(
        `${form.targetDate}T12:00:00`
      ).toLocaleDateString("en-US", {
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
          intern.name === form.assignee
            ? { ...intern, tasks: intern.tasks + 1 }
            : intern
        )
      );

      setNotice(`Task "${name}" created as pending in the preview.`);
    }

    dialogRef.current?.close();
  }

  const query = search.trim().toLowerCase();
  const matches = (value: string) => value.toLowerCase().includes(query);

  
    const visibleTeams = teams.filter(
    (team) =>
        matches(team.name) ||
        matches(team.lead) ||
        matches(team.status)
    );

    const visibleInterns = interns.filter(
    (intern) =>
        matches(intern.name) ||
        matches(intern.team) ||
        matches(intern.status)
    );

    const visibleMilestones = milestones.filter(
    (item) =>
        matches(item.projectName) ||
        matches(item.team) ||
        matches(item.type) ||
        matches(item.targetDate)
    );



  const visibleTasks = tasks.filter(
    (task) =>
      matches(task.name) ||
      matches(task.project) ||
      matches(task.assignee)
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
    <main className="min-h-screen bg-[var(--fb-v2-page-bg)] px-4 py-8 text-[var(--fb-v2-text)] sm:px-6">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <h1 className="text-2xl font-bold text-[var(--fb-v2-heading)]">
          Leadership Dashboard
        </h1>

        {/* ACTION BUTTONS AND SEARCH */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[var(--fb-v2-border)] py-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="fb-v2-btn-primary" onClick={() => openCreate("team")}>
              Create Team
            </button>

            <button type="button" className="fb-v2-btn-primary" onClick={() => openCreate("project")}>
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
                jumpToMatch();
            }}
            className="w-full sm:w-64"
            >
            <div className="flex items-center gap-2 rounded-md border border-[var(--fb-v2-input-border)] bg-[var(--fb-v2-input-bg)] px-3 focus-within:ring-2 focus-within:ring-[var(--fb-v2-accent)]">
                <button
                type="submit"
                aria-label="Jump to search result"
                title="Jump to search result"
                className="shrink-0 cursor-pointer text-[var(--fb-v2-text-muted)]"
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
                className="min-w-0 w-full bg-transparent py-2 text-sm text-[var(--fb-v2-text)] outline-none placeholder:text-[var(--fb-v2-text-muted)]"
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

        {noResults && (
          <p role="status" className="text-sm text-[var(--fb-v2-text-muted)]">
            No matches found for &quot;{search}&quot;.
          </p>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
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
            <h2 className="mb-3 text-lg font-semibold">
              NEW TASKS
            </h2>
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
                  <span className="text-sm text-[var(--fb-v2-text-muted)]">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* REUSABLE CREATE DIALOG */}
      <dialog
        ref={dialogRef}
        onClose={() => setMode(null)}
        className="fb-v2-dialog w-[430px] max-w-[90vw] rounded-lg border border-[var(--fb-v2-border)] bg-[var(--fb-v2-surface)] p-6 text-[var(--fb-v2-text)] shadow-xl"
      >
        {mode && (
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="text-xl font-semibold">
              {mode === "team"
                ? "Create Team"
                : mode === "project"
                  ? "Create Project"
                  : "Create Task"}
            </h2>

            <div>
              <label htmlFor="create-name" className="fb-v2-label">
                {mode === "team"
                  ? "Team name"
                  : mode === "project"
                    ? "Project name"
                    : "Task title"}
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
                className="rounded-md border border-[var(--fb-v2-border)] px-4 py-2 text-sm"
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
