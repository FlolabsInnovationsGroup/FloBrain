import type { TaskPerson, TaskStatus } from "@/types/task";
import { TASK_STATUS_LABELS } from "@/lib/tasks";

const LIST_MONTHS = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "Jun.",
  "Jul.",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
] as const;

/** Figma list dates look like "Aug. 28 2026". */
export function formatTaskListDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return iso;
  }
  return `${LIST_MONTHS[month - 1]} ${day} ${year}`;
}

/** "Claudia L., Serina Z." style for the Assigned To column. */
export function formatAssigneeList(people: readonly TaskPerson[]): string {
  if (people.length === 0) return "—";
  return people.map((person) => person.name).join(", ");
}

/** "Ceren G. + 5" when there are many assignees. */
export function formatAssigneeSummary(people: readonly TaskPerson[]): string {
  if (people.length === 0) return "Unassigned";
  if (people.length === 1) return people[0].name;
  return `${people[0].name} + ${people.length - 1}`;
}

export function taskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status];
}
