import type { Task, TaskPerson, TaskReference, TaskStatus } from "@/types/task";

import { mockPeople, mockProjects, mockTeams } from "./mockTaskOptions";

/**
 * Prototype rows for My Tasks. Replace with `api.getTasks()` once the backend exists.
 * `updatedAt` stands in for last accessed until the API returns that field.
 */
type MyTaskSeed = {
  id: string;
  title: string;
  teamId: string;
  projectId: string;
  assigneeIds: readonly string[];
  status: TaskStatus;
  /** How long ago the row was last accessed. */
  daysSinceAccess: number;
};

const seeds: readonly MyTaskSeed[] = [
  {
    id: "my-task-1",
    title: "Update Product Structure and Web Experience",
    teamId: "team-4",
    projectId: "project-4",
    assigneeIds: ["person-1", "person-2"],
    status: "active",
    daysSinceAccess: 0,
  },
  {
    id: "my-task-2",
    title: "Ship onboarding flow for caretakers",
    teamId: "team-1",
    projectId: "project-1",
    assigneeIds: ["person-3", "person-4", "person-5"],
    status: "active",
    daysSinceAccess: 0,
  },
  {
    id: "my-task-3",
    title: "Write handoff notes for the design system",
    teamId: "team-4",
    projectId: "project-4",
    assigneeIds: ["person-7", "person-11"],
    status: "active",
    daysSinceAccess: 1,
  },
  {
    id: "my-task-4",
    title: "Review Q3 analytics dashboard",
    teamId: "team-5",
    projectId: "project-2",
    assigneeIds: ["person-6"],
    status: "pending",
    daysSinceAccess: 2,
  },
  {
    id: "my-task-5",
    title: "Finalize robotics sprint scope",
    teamId: "team-3",
    projectId: "project-3",
    assigneeIds: ["person-8", "person-9"],
    status: "completed",
    daysSinceAccess: 3,
  },
  {
    id: "my-task-6",
    title: "Backlog triage for the mobile MVP",
    teamId: "team-2",
    projectId: "project-1",
    assigneeIds: ["person-10"],
    status: "overdue",
    daysSinceAccess: 5,
  },
  {
    id: "my-task-7",
    title: "Audit memory graph performance",
    teamId: "team-2",
    projectId: "project-2",
    assigneeIds: ["person-12"],
    status: "pending",
    daysSinceAccess: 7,
  },
  {
    id: "my-task-8",
    title: "Prepare the stakeholder demo",
    teamId: "team-1",
    projectId: "project-3",
    assigneeIds: ["person-1", "person-5"],
    status: "completed",
    daysSinceAccess: 12,
  },
];

function person(id: string): TaskPerson {
  const option = mockPeople.find((entry) => entry.id === id);
  return { id, name: option?.label ?? id };
}

function reference(id: string, options: readonly { id: string; label: string }[]): TaskReference {
  const option = options.find((entry) => entry.id === id);
  return { id, name: option?.label ?? id };
}

function dateDaysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function emptySections(): Task["sections"] {
  return {
    objective: "",
    context: "",
    requirements: [],
    steps: [],
    deliverables: [],
    acceptanceCriteria: [],
  };
}

export const mockMyTasks: Task[] = seeds.map((seed) => ({
  id: seed.id,
  title: seed.title,
  description: seed.title,
  project: reference(seed.projectId, mockProjects),
  team: reference(seed.teamId, mockTeams),
  projectManager: person("person-3"),
  createdBy: person("person-1"),
  assignedTo: seed.assigneeIds.map(person),
  dueDate: dateDaysFromNow(14).toISOString().slice(0, 10),
  priority: "medium",
  status: seed.status,
  sections: emptySections(),
  createdAt: dateDaysFromNow(-seed.daysSinceAccess - 14).toISOString(),
  updatedAt: dateDaysFromNow(-seed.daysSinceAccess).toISOString(),
}));

export function getMockMyTasks(): Task[] {
  return mockMyTasks;
}
