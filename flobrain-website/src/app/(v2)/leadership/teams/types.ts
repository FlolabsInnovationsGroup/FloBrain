export interface Team {
  id: string;
  name: string;
  lead: string;
  description: string;
  progress: number;
  memberCount: number;
  completedTasks: number;
  totalTasks: number;
}

export const TEAM_PROJECT_STAGES = [
  "Research",
  "Wireframes",
  "UI Design",
  "Development",
  "Testing",
  "Complete",
] as const;

export type TeamProjectStage = (typeof TEAM_PROJECT_STAGES)[number];

export interface TeamProject {
  id: string;
  name: string;
  activeTasks: number;
  closedTasks: number;
  activeInterns: number;
  /** Overall project completion 0–100 (drives the staged progress bar). */
  progress: number;
}

export interface TeamDetail extends Team {
  blockers: number;
  activeProjects: number;
  activeInterns: number;
  projects: TeamProject[];
}
