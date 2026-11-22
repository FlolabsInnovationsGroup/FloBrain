import type { Team } from "./TeamOverview";
import type { Intern } from "./InternOverview";
import type { Milestone } from "./DeadlinesMilestones";

export type DemoTask = {
  id: number;
  name: string;
  project: string;
  assignee: string;
};

export const initialTeams: Team[] = [
  { id: 1, name: "Frontend", lead: "Maria", members: 6, progress: 75, status: "On track" },
  { id: 2, name: "Backend", lead: "Ofon", members: 8, progress: 60, status: "At risk" },
  { id: 3, name: "Design", lead: "Ceren", members: 4, progress: 90, status: "On track" },
];

export const initialInterns: Intern[] = [
  { id: 1, name: "Demo Intern A", team: "Frontend", tasks: 4, progress: 70, status: "Active" },
  { id: 2, name: "Demo Intern B", team: "Backend", tasks: 3, progress: 45, status: "Away" },
  { id: 3, name: "Demo Intern C", team: "Design", tasks: 5, progress: 90, status: "Active" },
];

export const initialMilestones: Milestone[] = [
  {
    id: 1,
    projectName: "FloBrain V2 Dashboard",
    type: "Milestone",
    team: "Frontend",
    targetDate: "Oct 28, 2026",
  },
  {
    id: 2,
    projectName: "User Authentication",
    type: "Deadline",
    team: "Backend",
    targetDate: "Nov 2, 2026",
  },
  {
    id: 3,
    projectName: "UI Design Review",
    type: "Milestone",
    team: "Design",
    targetDate: "Nov 5, 2026",
  },
];
