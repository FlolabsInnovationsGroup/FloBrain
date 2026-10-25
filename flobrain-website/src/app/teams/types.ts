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
