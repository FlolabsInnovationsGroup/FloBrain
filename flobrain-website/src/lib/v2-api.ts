/**
 * V2 API layer — backend types, query keys, and fetch functions for V2 pages.
 * Uses apiClient (Axios instance with JWT auth).
 */

import { apiClient } from "./axios";

// ─── Backend response types ───────────────────────────────────────────────────

export type TeamApi = {
  id: number;
  name: string;
  description: string;
  lead: string;
  member_count: number;
  progress: number;
  completed_tasks: number;
  total_tasks: number;
  created_at: string;
};

export type TeamProjectApi = {
  id: number;
  name: string;
  active_tasks: number;
  closed_tasks: number;
  active_interns: number;
  progress: number;
};

export type TeamDetailApi = TeamApi & {
  blockers: number;
  active_interns: number;
  active_projects: number;
  projects: TeamProjectApi[];
};

export type InternApi = {
  id: string;
  name: string;
  designation: string;
  team: string;
  project: string;
  hours: number;
  specialization: string;
};

export type ProjectApi = {
  id: number;
  name: string;
  team: string;
  team_lead: string;
  interns: number;
  progress: number;
  status: string;
  target_date: string | null;
};

export type TaskBoardApi = {
  id: number;
  name: string;
  board_type: "personal" | "team";
};

export type AssignedTaskApi = {
  id: string;
  title: string;
  description: string;
  status: "active" | "pending" | "overdue" | "inactive" | "completed";
  priority: "high" | "medium" | "low";
  due_date: string | null;
  board: TaskBoardApi;
  created_by: string;
  assigned_to: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
};

export type RecentDocActivityApi = {
  id: number;
  title: string;
  type: "document" | "attachment";
  date: string;
};

export type DocumentApi = {
  id: number;
  title: string;
  is_favorite: boolean;
  updated_at: string;
};

export type AttachmentApi = {
  id: number;
  name: string;
  file_url: string | null;
  is_favorite: boolean;
  created_at: string;
};

export type CalendarEventApi = {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
};

export type TodoApi = {
  id: number;
  title: string;
  completed: boolean;
};

// ─── TanStack Query keys ──────────────────────────────────────────────────────

export const v2Keys = {
  teams: ["v2", "teams"] as const,
  team: (id: string | number) => ["v2", "teams", String(id)] as const,
  interns: ["v2", "interns"] as const,
  projects: ["v2", "projects"] as const,
  tasksAssignedToMe: ["v2", "tasks", "assigned-to-me"] as const,
  tasksCreatedByMe: ["v2", "tasks", "created-by-me"] as const,
  docsRecent: ["v2", "docs", "recent"] as const,
  docs: ["v2", "docs"] as const,
  attachments: ["v2", "docs", "attachments"] as const,
  calendarEvents: ["v2", "calendar", "events"] as const,
  todos: ["v2", "calendar", "todos"] as const,
};

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function fetchTeams(): Promise<TeamApi[]> {
  const r = await apiClient.get<TeamApi[]>("/api/teams/");
  return r.data;
}

export async function fetchTeam(id: string | number): Promise<TeamDetailApi> {
  const r = await apiClient.get<TeamDetailApi>(`/api/teams/${id}/`);
  return r.data;
}

export async function fetchInterns(): Promise<InternApi[]> {
  const r = await apiClient.get<InternApi[]>("/api/interns/");
  return r.data;
}

export async function fetchProjects(): Promise<ProjectApi[]> {
  const r = await apiClient.get<ProjectApi[]>("/api/projects/");
  return r.data;
}

export async function fetchTasksAssignedToMe(): Promise<AssignedTaskApi[]> {
  const r = await apiClient.get<AssignedTaskApi[]>("/api/tasks/assigned-to-me/");
  return r.data;
}

export async function fetchTasksCreatedByMe(): Promise<AssignedTaskApi[]> {
  const r = await apiClient.get<AssignedTaskApi[]>("/api/tasks/created-by-me/");
  return r.data;
}

export async function fetchDocsRecent(): Promise<RecentDocActivityApi[]> {
  const r = await apiClient.get<RecentDocActivityApi[]>("/api/docs/recent/");
  return r.data;
}

export async function fetchDocs(): Promise<DocumentApi[]> {
  const r = await apiClient.get<DocumentApi[]>("/api/docs/");
  return r.data;
}

export async function fetchAttachments(): Promise<AttachmentApi[]> {
  const r = await apiClient.get<AttachmentApi[]>("/api/docs/attachments/");
  return r.data;
}

export async function fetchCalendarEvents(): Promise<CalendarEventApi[]> {
  const r = await apiClient.get<CalendarEventApi[]>("/api/calendar/events/");
  return r.data;
}

export async function fetchTodos(): Promise<TodoApi[]> {
  const r = await apiClient.get<TodoApi[]>("/api/calendar/todos/");
  return r.data;
}

// ─── Helper: format ISO date string → "Dec 15, 2026" ─────────────────────────

export function formatIsoDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate.replace(/-/g, "/"));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
