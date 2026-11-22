// Mock lookups for the V2 prototype. Replace with api.getProjects(), api.getTeams() and
// api.getInterns() once the backend exists. View Tasks can reuse these IDs for mock rows.
import type { TaskOption } from "@/types/task";

export type TaskProjectOption = TaskOption & {
  /** Used to prefill the form's team when the project is chosen. */
  teamId?: string;
  /** Used to prefill the form's project manager when the project is chosen. */
  projectManagerId?: string;
};

export type TaskFormOptions = {
  projects: readonly TaskProjectOption[];
  teams: readonly TaskOption[];
  people: readonly TaskOption[];
};

export const mockPeople: TaskOption[] = [
  { id: "person-1", label: "Amara Okafor" },
  { id: "person-2", label: "Ben Lewis" },
  { id: "person-3", label: "Ceren Yilmaz" },
  { id: "person-4", label: "Daniel Park" },
  { id: "person-5", label: "Elena Rossi" },
  { id: "person-6", label: "Farah Haddad" },
  { id: "person-7", label: "Hana Sato" },
  { id: "person-8", label: "Jonas Weber" },
  { id: "person-9", label: "Maria Lopez" },
  { id: "person-10", label: "Nikhil Rao" },
  { id: "person-11", label: "Priya Shah" },
  { id: "person-12", label: "Sam Taylor" },
];

export const mockTeams: TaskOption[] = [
  { id: "team-1", label: "Flo-Brain Front End" },
  { id: "team-2", label: "Flo-Brain Backend" },
  { id: "team-3", label: "AI & Robotics Team" },
  { id: "team-4", label: "Design Team" },
  { id: "team-5", label: "Analytics Team" },
];

export const mockProjects: TaskProjectOption[] = [
  {
    id: "project-1",
    label: "Wearable Companion App",
    teamId: "team-1",
    projectManagerId: "person-1",
  },
  { id: "project-2", label: "Memory Graph v2", teamId: "team-2", projectManagerId: "person-5" },
  { id: "project-3", label: "Robotics Dashboard", teamId: "team-3", projectManagerId: "person-8" },
  { id: "project-4", label: "Brand Refresh" },
];

export const mockTaskFormOptions: TaskFormOptions = {
  projects: mockProjects,
  teams: mockTeams,
  people: mockPeople,
};
