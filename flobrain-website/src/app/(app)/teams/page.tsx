"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileAudio,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Users,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/layout/dialog";

type Project = {
  id: string;
  name: string;
  progress: number;
};

type Team = {
  id: string;
  name: string;
  lead: string;
  description: string;
  blockers: number;
  activeProjects: number;
  activeInterns: number;
  projects: Project[];
  activeTasks: number;
  closedTasks: number;
};

type CreateKind = "team" | "project" | "task";

const initialTeams: Team[] = [
  {
    id: "design",
    name: "Design Team",
    lead: "Geren Genc",
    description: "UX research, product design, prototyping and visual identity.",
    blockers: 0,
    activeProjects: 3,
    activeInterns: 5,
    projects: [
      { id: "healthbuddy", name: "HealthBuddy", progress: 48 },
      { id: "project-2", name: "Project #2", progress: 0 },
      { id: "project-3", name: "Project #3", progress: 0 },
      { id: "project-4", name: "Project #4", progress: 0 },
      { id: "project-5", name: "Project #5", progress: 0 },
    ],
    activeTasks: 12,
    closedTasks: 8,
  },
  {
    id: "frontend",
    name: "Flo-Brain front end",
    lead: "Frontend Lead",
    description: "Building clear, accessible experiences for the FloBrain platform.",
    blockers: 1,
    activeProjects: 2,
    activeInterns: 4,
    projects: [
      { id: "website", name: "FloBrain Website", progress: 62 },
      { id: "design-system", name: "V2 Design System", progress: 28 },
    ],
    activeTasks: 9,
    closedTasks: 14,
  },
  {
    id: "backend",
    name: "Flo-Brain backend",
    lead: "Backend Lead",
    description: "APIs, data services and reliable platform infrastructure.",
    blockers: 2,
    activeProjects: 2,
    activeInterns: 3,
    projects: [
      { id: "api", name: "Platform API", progress: 55 },
      { id: "memory", name: "Memory Service", progress: 36 },
    ],
    activeTasks: 11,
    closedTasks: 10,
  },
  {
    id: "ai",
    name: "AI & Robotics Team",
    lead: "Robotics Lead",
    description: "Intelligent agents, robotics workflows and automation.",
    blockers: 0,
    activeProjects: 3,
    activeInterns: 6,
    projects: [
      { id: "agents", name: "AI Agents", progress: 73 },
      { id: "robotics", name: "Robotics Platform", progress: 41 },
      { id: "automation", name: "Automation", progress: 20 },
    ],
    activeTasks: 16,
    closedTasks: 21,
  },
];

const groups = ["Admin", "Finance", "Executive"];
const additionalTeams = [
  "Automation Team",
  "Analytics Team",
  "Space Team",
  "Legal Team",
  "Moodchanger Team",
  "Development Team",
];
const buddyColors = [
  "border-[var(--fb-v2-buddy-cyan)]",
  "border-[var(--fb-v2-buddy-green)]",
  "border-[var(--fb-v2-buddy-pink)]",
  "border-[var(--fb-v2-buddy-orange)]",
  "border-[var(--fb-v2-buddy-green)]",
  "border-[var(--fb-v2-buddy-purple)]",
  "border-[var(--fb-v2-accent)]",
  "border-[var(--fb-v2-buddy-cyan)]",
  "border-[var(--fb-v2-buddy-pink)]",
];

const createLabels: Record<CreateKind, string> = {
  team: "Create Team",
  project: "Create Project",
  task: "Create Task",
};

const tabs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Interns" },
  { label: "Teams", href: "/teams" },
  { label: "Project" },
  { label: "Tasks" },
  { label: "Scorecard" },
  { label: "Team Activity" },
] as const;

export default function TeamsPage() {
  const [teams, setTeams] = useState(initialTeams);
  const [selectedTeamId, setSelectedTeamId] = useState("design");
  const [roomSearch, setRoomSearch] = useState("");
  const [createKind, setCreateKind] = useState<CreateKind | null>(null);
  const [newName, setNewName] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeBuddy, setActiveBuddy] = useState<number | null>(null);
  const [showTeamList, setShowTeamList] = useState(false);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];
  const filteredTeams = useMemo(
    () => teams.filter((team) => team.name.toLowerCase().includes(roomSearch.trim().toLowerCase())),
    [roomSearch, teams]
  );
  const elapsedTime = `${String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0")}:${String(
    Math.floor((elapsedSeconds % 3600) / 60)
  ).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  function openCreateDialog(kind: CreateKind) {
    setNewName("");
    setCreateKind(kind);
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name || !createKind) return;

    if (createKind === "team") {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name,
        lead: "You",
        description: "A new team. Add a description when team details are connected.",
        blockers: 0,
        activeProjects: 0,
        activeInterns: 0,
        projects: [],
        activeTasks: 0,
        closedTasks: 0,
      };
      setTeams((current) => [...current, newTeam]);
      setSelectedTeamId(newTeam.id);
      setShowTeamList(true);
    } else if (createKind === "project") {
      setTeams((current) =>
        current.map((team) =>
          team.id === selectedTeamId
            ? {
                ...team,
                activeProjects: team.activeProjects + 1,
                projects: [...team.projects, { id: `project-${Date.now()}`, name, progress: 0 }],
              }
            : team
        )
      );
    } else {
      setTeams((current) =>
        current.map((team) =>
          team.id === selectedTeamId ? { ...team, activeTasks: team.activeTasks + 1 } : team
        )
      );
    }

    setCreateKind(null);
    setNewName("");
  }

  return (
    <main className="min-h-[100svh] bg-[var(--fb-v2-page-bg)] text-[var(--fb-v2-text)]">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[2rem_13.75rem_minmax(0,1fr)_11rem] xl:grid-cols-[2rem_13.75rem_minmax(0,1fr)_12rem]">
        <nav
          aria-label="Primary"
          className="hidden flex-col items-center gap-4 border-r border-[var(--fb-v2-border)] bg-[var(--fb-v2-sidebar-bg)] py-4 lg:flex"
        >
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className="rounded-lg p-1.5 text-[var(--fb-v2-accent)] hover:bg-[var(--fb-v2-surface-raised)]"
          >
            <BrainCircuit size={18} />
          </Link>
          <Link
            href="/teams"
            aria-label="Teams"
            aria-current="page"
            className="rounded-lg bg-[var(--fb-v2-accent-subtle)] p-1.5 text-[var(--fb-v2-accent)]"
          >
            <Users size={16} />
          </Link>
          <Link
            href="/brain"
            aria-label="Chat"
            className="rounded-lg p-1.5 text-[var(--fb-v2-text-muted)] hover:bg-[var(--fb-v2-surface-raised)]"
          >
            <MessageCircle size={16} />
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="mt-auto rounded-lg p-1.5 text-[var(--fb-v2-text-muted)] hover:bg-[var(--fb-v2-surface-raised)]"
          >
            <Settings size={16} />
          </Link>
        </nav>

        <aside className="hidden min-h-[100svh] flex-col border-r border-[var(--fb-v2-border)] bg-[var(--fb-v2-sidebar-bg)] lg:flex">
          <section className="border-b border-[var(--fb-v2-border)] px-3 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--fb-v2-heading)]">
              <Video size={14} aria-hidden="true" />
              MEETINGS
            </h2>
            <div className="mt-3 flex items-center justify-between gap-1">
              <button
                type="button"
                className="flex items-center gap-1 text-[10px] text-[var(--fb-v2-text-muted)] hover:text-[var(--fb-v2-heading)]"
              >
                Meeting Links <ChevronDown size={12} />
              </button>
              <button
                type="button"
                className="flex items-center gap-1 text-[10px] text-[var(--fb-v2-text-muted)] hover:text-[var(--fb-v2-heading)]"
              >
                Recordings <ChevronDown size={12} />
              </button>
              <button
                type="button"
                className="flex items-center gap-1 text-[10px] text-[var(--fb-v2-text-muted)] hover:text-[var(--fb-v2-heading)]"
              >
                Transcripts <ChevronDown size={12} />
              </button>
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col px-2 py-3">
            <div className="px-1">
              <h2 className="text-sm font-medium text-[var(--fb-v2-heading)]">Chat Rooms</h2>
              <p className="text-[10px] text-[var(--fb-v2-text-muted)]">
                Channels, Groups and DM&apos;s
              </p>
            </div>
            <label className="mt-3 flex h-8 items-center gap-2 rounded border border-[var(--fb-v2-border)] bg-[var(--fb-v2-surface)] px-2 text-[var(--fb-v2-text-subtle)]">
              <Search size={14} aria-hidden="true" />
              <span className="sr-only">Search rooms and teams</span>
              <input
                type="search"
                value={roomSearch}
                onChange={(event) => setRoomSearch(event.target.value)}
                placeholder="Search Rooms"
                className="min-w-0 flex-1 bg-transparent text-[10px] text-[var(--fb-v2-text)] outline-none placeholder:text-[var(--fb-v2-text-subtle)]"
              />
            </label>

            <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-3 text-xs">
              <div>
                <h3 className="mb-1 font-medium uppercase text-[var(--fb-v2-text-muted)]">
                  Groups
                </h3>
                {groups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    className="block w-full truncate py-0.5 pl-3 text-left text-[var(--fb-v2-text)] hover:text-[var(--fb-v2-accent)]"
                  >
                    {group}
                  </button>
                ))}
              </div>
              <div>
                <h3 className="mb-1 font-medium uppercase text-[var(--fb-v2-text-muted)]">Teams</h3>
                {filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setShowTeamList(false);
                    }}
                    aria-current={team.id === selectedTeamId ? "true" : undefined}
                    className={`block w-full truncate py-0.5 pl-3 text-left transition-colors hover:text-[var(--fb-v2-accent)] ${
                      team.id === selectedTeamId
                        ? "font-semibold text-[var(--fb-v2-heading)]"
                        : "text-[var(--fb-v2-text)]"
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
                {additionalTeams
                  .filter((name) => name.toLowerCase().includes(roomSearch.trim().toLowerCase()))
                  .map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="block w-full truncate py-0.5 pl-3 text-left text-[var(--fb-v2-text)] hover:text-[var(--fb-v2-accent)]"
                    >
                      {name}
                    </button>
                  ))}
              </div>
              <div>
                <h3 className="mb-2 font-medium uppercase text-[var(--fb-v2-text-muted)]">
                  Direct Messages
                </h3>
                <button
                  type="button"
                  aria-label="Open direct message with member one"
                  className="block py-1 text-[var(--fb-v2-buddy-cyan)]"
                >
                  <MessageCircle size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Open direct message with member two"
                  className="block py-1 text-[var(--fb-v2-buddy-cyan)]"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--fb-v2-border)] px-3 pt-3 text-xs">
              <Link
                href="/settings"
                className="block text-[var(--fb-v2-text)] hover:text-[var(--fb-v2-accent)]"
              >
                Settings
              </Link>
              <Link
                href="/signin"
                className="mt-1 block text-[var(--fb-v2-error)] hover:opacity-80"
              >
                Sign Out
              </Link>
            </div>
          </section>
        </aside>

        <section className="flex min-h-[100svh] min-w-0 flex-col overflow-hidden">
          <nav
            aria-label="Dashboard sections"
            className="flex h-14 shrink-0 items-stretch overflow-x-auto border-b border-[var(--fb-v2-border)] px-3 sm:px-5"
          >
            {tabs.map((tab) =>
              "href" in tab ? (
                <Link
                  key={tab.label}
                  href={tab.href}
                  aria-current={tab.label === "Teams" ? "page" : undefined}
                  className={`flex shrink-0 items-center border-b-2 px-2 text-[10px] font-medium uppercase transition-colors sm:px-3 sm:text-xs ${
                    tab.label === "Teams"
                      ? "border-[var(--fb-v2-accent)] text-[var(--fb-v2-heading)]"
                      : "border-transparent text-[var(--fb-v2-text-muted)] hover:text-[var(--fb-v2-heading)]"
                  }`}
                >
                  {tab.label}
                </Link>
              ) : (
                <button
                  key={tab.label}
                  type="button"
                  disabled
                  title={`${tab.label} screen is not available yet`}
                  className="flex shrink-0 cursor-not-allowed items-center border-b-2 border-transparent px-2 text-[10px] font-medium uppercase text-[var(--fb-v2-text-subtle)] sm:px-3 sm:text-xs"
                >
                  {tab.label}
                </button>
              )
            )}
          </nav>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex shrink-0 flex-wrap gap-2 border-b border-[var(--fb-v2-border)] px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => openCreateDialog("team")}
                className="inline-flex items-center gap-1.5 rounded bg-[var(--fb-v2-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--fb-v2-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fb-v2-accent)]"
              >
                <Plus size={14} /> Create Team
              </button>
              <button
                type="button"
                onClick={() => openCreateDialog("project")}
                className="inline-flex items-center gap-1.5 rounded bg-[var(--fb-v2-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--fb-v2-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fb-v2-accent)]"
              >
                <Plus size={14} /> Create Project
              </button>
              <button
                type="button"
                onClick={() => openCreateDialog("task")}
                className="inline-flex items-center gap-1.5 rounded bg-[var(--fb-v2-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--fb-v2-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fb-v2-accent)]"
              >
                <Plus size={14} /> Create Task
              </button>
            </div>

            <div className="min-h-0 flex-1 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setShowTeamList((visible) => !visible)}
                aria-expanded={showTeamList}
                className="mb-4 inline-flex items-center gap-2 text-xs text-[var(--fb-v2-text-muted)] hover:text-[var(--fb-v2-heading)]"
              >
                <ArrowLeft size={14} /> {showTeamList ? "Close Team List" : "Back to Teams"}
              </button>

              {showTeamList && (
                <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => {
                        setSelectedTeamId(team.id);
                        setShowTeamList(false);
                      }}
                      className={`rounded border p-3 text-left transition-colors hover:border-[var(--fb-v2-accent)] ${
                        team.id === selectedTeamId
                          ? "border-[var(--fb-v2-accent)] bg-[var(--fb-v2-accent-subtle)]"
                          : "border-[var(--fb-v2-border)] bg-[var(--fb-v2-surface)]"
                      }`}
                    >
                      <span className="block text-sm font-medium text-[var(--fb-v2-heading)]">
                        {team.name}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--fb-v2-text-muted)]">
                        Lead: {team.lead}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <article className="border border-[var(--fb-v2-border)] bg-[var(--fb-v2-surface)] p-4 sm:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--fb-v2-text-muted)]">
                      <Users size={14} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-sm font-medium uppercase text-[var(--fb-v2-heading)]">
                        {selectedTeam.name}
                      </h1>
                      <p className="mt-0.5 text-xs text-[var(--fb-v2-text-muted)]">
                        Lead: {selectedTeam.lead}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--fb-v2-text-muted)]">
                        {selectedTeam.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 md:min-w-[13rem]">
                    {[
                      { label: "Blockers", value: selectedTeam.blockers },
                      { label: "Active Projects", value: selectedTeam.activeProjects },
                      { label: "Active Interns", value: selectedTeam.activeInterns },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="flex min-h-[3.5rem] flex-col items-center justify-center rounded border border-[var(--fb-v2-text-muted)] px-2 py-1.5 text-center"
                      >
                        <span className="text-sm font-semibold text-[var(--fb-v2-heading)]">
                          {metric.value}
                        </span>
                        <span className="text-[9px] leading-tight text-[var(--fb-v2-text-muted)]">
                          {metric.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <div className="mt-6 grid gap-3 text-[10px] font-medium uppercase text-[var(--fb-v2-text-muted)] sm:grid-cols-2 xl:grid-cols-4">
                <p>
                  Project:{" "}
                  <span className="text-[var(--fb-v2-text)]">
                    {selectedTeam.projects[0]?.name ?? "—"}
                  </span>
                </p>
                <p>
                  Active Tasks:{" "}
                  <span className="text-[var(--fb-v2-text)]">{selectedTeam.activeTasks}</span>
                </p>
                <p>
                  Closed Tasks:{" "}
                  <span className="text-[var(--fb-v2-text)]">{selectedTeam.closedTasks}</span>
                </p>
                <p>
                  Active Interns:{" "}
                  <span className="text-[var(--fb-v2-text)]">{selectedTeam.activeInterns}</span>
                </p>
              </div>

              {selectedTeam.projects.length > 0 && (
                <section aria-label="Project progress" className="mt-4">
                  <div className="flex h-3 overflow-hidden rounded-sm bg-[var(--fb-v2-surface-raised)]">
                    {selectedTeam.projects.map((project, index) => (
                      <div
                        key={project.id}
                        className={`h-full border-r-2 border-[var(--fb-v2-page-bg)] ${
                          index === 0
                            ? "bg-[var(--fb-v2-success)]"
                            : "bg-[var(--fb-v2-text-subtle)]"
                        }`}
                        style={{ width: `${100 / selectedTeam.projects.length}%` }}
                        title={`${project.name}: ${project.progress}%`}
                      >
                        {project.progress > 0 && (
                          <span className="block truncate text-center text-[9px] leading-3 text-white">
                            {project.progress}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-[var(--fb-v2-text-muted)] sm:grid-cols-3 xl:grid-cols-6">
                    {[
                      "Research",
                      "Wireframes",
                      "UI Design",
                      "Development",
                      "Testing",
                      "Complete",
                    ].map((stage) => (
                      <span key={stage} className="truncate text-center">
                        {stage}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section aria-label="Team projects" className="mt-5 space-y-3 pb-3">
                {selectedTeam.projects.length === 0 ? (
                  <div className="flex min-h-24 flex-col items-center justify-center gap-2 border border-dashed border-[var(--fb-v2-border)] text-center">
                    <p className="text-sm text-[var(--fb-v2-text-muted)]">
                      No projects for this team yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => openCreateDialog("project")}
                      className="text-xs font-medium text-[var(--fb-v2-accent)] hover:underline"
                    >
                      Create a project
                    </button>
                  </div>
                ) : (
                  selectedTeam.projects.map((project, index) => (
                    <article
                      key={project.id}
                      className="flex min-h-[3.5rem] items-center justify-between border border-[var(--fb-v2-border)] bg-[var(--fb-v2-surface)] px-3 py-2.5"
                    >
                      <div>
                        <h2 className="text-[11px] font-semibold uppercase text-[var(--fb-v2-text)]">
                          {index === 0 ? `Project: ${project.name}` : project.name}
                        </h2>
                        {project.progress > 0 && (
                          <p className="mt-1 text-[10px] text-[var(--fb-v2-text-muted)]">
                            {project.progress}% complete
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={`More options for ${project.name}`}
                        className="rounded p-1 text-[var(--fb-v2-text-muted)] hover:bg-[var(--fb-v2-surface-raised)]"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </article>
                  ))
                )}
              </section>
              <p className="pb-3 text-center text-[10px] text-[var(--fb-v2-text-subtle)]">
                Sample data only. Changes are temporary and reset when you refresh.
              </p>
            </div>
          </div>
        </section>

        <aside className="hidden min-h-[100svh] flex-col border-l border-[var(--fb-v2-border)] bg-[var(--fb-v2-sidebar-bg)] p-3 lg:flex">
          <div className="flex h-12 items-center justify-center gap-3 rounded bg-[var(--fb-v2-surface)]">
            <span className="font-mono text-[10px] tabular-nums text-[var(--fb-v2-text)]">
              {elapsedTime}
            </span>
            <span
              className={`size-6 rounded-full border-2 ${isTimerRunning ? "animate-spin border-[var(--fb-v2-success)] border-t-transparent" : "border-[var(--fb-v2-accent)] border-t-[var(--fb-v2-text-subtle)]"}`}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setIsTimerRunning((running) => !running)}
              aria-label={isTimerRunning ? "Pause timer" : "Start timer"}
              className="rounded p-1 text-[var(--fb-v2-heading)] hover:bg-[var(--fb-v2-surface-raised)]"
            >
              {isTimerRunning ? (
                <span className="block size-3 bg-current" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <h2 className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--fb-v2-heading)]">
              <Bot size={16} /> Buddies - AI Agents
            </h2>
            <p className="mt-2 text-xs text-[var(--fb-v2-text-muted)]">
              Tap a Buddy to route chat.
            </p>
          </div>

          <div className="mt-5 flex flex-1 flex-col gap-2">
            {buddyColors.map((color, index) => (
              <button
                key={color + index}
                type="button"
                onClick={() => setActiveBuddy(index)}
                aria-label={`Route chat to Buddy ${index + 1}`}
                aria-pressed={activeBuddy === index}
                className={`flex min-h-9 flex-1 items-center justify-center rounded border bg-[var(--fb-v2-surface)] px-2 transition-colors hover:bg-[var(--fb-v2-surface-raised)] ${color} ${
                  activeBuddy === index ? "ring-2 ring-[var(--fb-v2-accent)]" : ""
                }`}
              >
                {activeBuddy === index ? (
                  <span className="flex items-center gap-1 text-[10px] text-[var(--fb-v2-text)]">
                    <Check size={12} /> Buddy {index + 1}
                  </span>
                ) : (
                  <span className="sr-only">Buddy {index + 1}</span>
                )}
              </button>
            ))}
          </div>
          {activeBuddy !== null && (
            <p
              role="status"
              className="mt-2 text-center text-[10px] text-[var(--fb-v2-text-muted)]"
            >
              Chat routed to Buddy {activeBuddy + 1}
            </p>
          )}
          <div className="mt-3 flex justify-center gap-3 text-[var(--fb-v2-text-subtle)]">
            <button
              type="button"
              aria-label="Open meeting links"
              className="hover:text-[var(--fb-v2-text)]"
            >
              <Link2 size={14} />
            </button>
            <button
              type="button"
              aria-label="Open recordings"
              className="hover:text-[var(--fb-v2-text)]"
            >
              <FileAudio size={14} />
            </button>
            <button type="button" aria-label="Help" className="hover:text-[var(--fb-v2-text)]">
              <CircleHelp size={14} />
            </button>
            <button
              type="button"
              aria-label="Time activity"
              className="hover:text-[var(--fb-v2-text)]"
            >
              <Clock3 size={14} />
            </button>
          </div>
        </aside>
      </div>

      <Dialog
        open={createKind !== null}
        onOpenChange={(open) => {
          if (!open) setCreateKind(null);
        }}
      >
        {createKind && (
          <DialogContent
            showCloseButton={false}
            className="z-[121] border-[var(--fb-v2-border)] bg-[var(--fb-v2-sidebar-bg)] text-[var(--fb-v2-text)]"
            overlayClassName="z-[120] bg-black/60"
          >
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-[var(--fb-v2-heading)]">
                    {createLabels[createKind]}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-xs text-[var(--fb-v2-text-muted)]">
                    This prototype stores changes only until you refresh.
                  </DialogDescription>
                </div>
                <DialogClose asChild>
                  <button
                    type="button"
                    aria-label="Close dialog"
                    className="rounded p-1 text-[var(--fb-v2-text-muted)] hover:bg-[var(--fb-v2-surface-raised)]"
                  >
                    <X size={18} />
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <label
                htmlFor="create-name"
                className="block text-xs font-medium text-[var(--fb-v2-text-muted)]"
              >
                {createKind === "team"
                  ? "Team name"
                  : createKind === "project"
                    ? "Project name"
                    : "Task name"}
              </label>
              <input
                id="create-name"
                autoFocus
                required
                maxLength={80}
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder={`Enter ${createKind} name`}
                className="w-full rounded border border-[var(--fb-v2-border)] bg-[var(--fb-v2-surface)] px-3 py-2 text-sm text-[var(--fb-v2-text)] outline-none placeholder:text-[var(--fb-v2-text-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--fb-v2-accent)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateKind(null)}
                  className="rounded border border-[var(--fb-v2-border)] px-3 py-2 text-xs text-[var(--fb-v2-text-muted)] hover:bg-[var(--fb-v2-surface-raised)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[var(--fb-v2-accent)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--fb-v2-accent-hover)]"
                >
                  Create
                </button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
}
