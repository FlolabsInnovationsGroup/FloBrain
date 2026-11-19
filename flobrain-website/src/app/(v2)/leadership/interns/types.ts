export interface Intern {
  id: string;
  name: string;
  designation: string;
  team: string;
  project: string;
  hours: number;
  specialization: string;
}

/** Weekly hours target shown on every intern card. */
export const WEEKLY_HOURS = 40;
