export type ProjectStatus = "On Track" | "At Risk" | "Completed";

export interface Project {
  id: string;
  name: string;
  teamLead: string;
  team: string;
  interns: number;
  progress: number;
  status: ProjectStatus;
  targetDate: string;
}
