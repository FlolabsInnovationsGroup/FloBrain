import type { CreateTaskInput, TaskPriority, TaskStatus } from "@/types/task";

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  active: "Active",
  pending: "Pending",
  overdue: "Overdue",
  inactive: "Inactive",
  completed: "Completed",
};

export const TASK_PRIORITY_OPTIONS: readonly { value: TaskPriority; label: string }[] = [
  { value: "high", label: TASK_PRIORITY_LABELS.high },
  { value: "medium", label: TASK_PRIORITY_LABELS.medium },
  { value: "low", label: TASK_PRIORITY_LABELS.low },
];

/** Overdue is derived from the due date, and completed is set later, so neither is offered at creation. */
export const CREATABLE_TASK_STATUSES: readonly TaskStatus[] = ["active", "pending"];

/** Form state. List sections are plain text here, one item per line. */
export type CreateTaskFormState = {
  title: string;
  projectId: string;
  projectManagerId: string;
  dueDate: string;
  teamId: string;
  description: string;
  objective: string;
  context: string;
  requirements: string;
  steps: string;
  deliverables: string;
  acceptanceCriteria: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeIds: string[];
};

export type CreateTaskField =
  | "title"
  | "projectId"
  | "projectManagerId"
  | "dueDate"
  | "teamId"
  | "description";

export type CreateTaskErrors = Partial<Record<CreateTaskField, string>>;

/** Visual order of the required fields, used to focus the first invalid one. */
export const CREATE_TASK_FIELD_ORDER: readonly CreateTaskField[] = [
  "title",
  "projectId",
  "projectManagerId",
  "dueDate",
  "teamId",
  "description",
];

export const TASK_TITLE_MAX_LENGTH = 120;

export function emptyCreateTaskForm(): CreateTaskFormState {
  return {
    title: "",
    projectId: "",
    projectManagerId: "",
    dueDate: "",
    teamId: "",
    description: "",
    objective: "",
    context: "",
    requirements: "",
    steps: "",
    deliverables: "",
    acceptanceCriteria: "",
    priority: "high",
    status: "active",
    assigneeIds: [],
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Today's date in the user's local timezone as YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function validateCreateTask(
  form: CreateTaskFormState,
  today: string = todayISO()
): CreateTaskErrors {
  const errors: CreateTaskErrors = {};
  const title = form.title.trim();

  if (!title) errors.title = "Enter a task name.";
  else if (title.length > TASK_TITLE_MAX_LENGTH) {
    errors.title = `Task name must be ${TASK_TITLE_MAX_LENGTH} characters or fewer.`;
  }
  if (!form.projectId) errors.projectId = "Choose a project.";
  if (!form.projectManagerId) errors.projectManagerId = "Choose a project manager.";
  if (!form.dueDate) errors.dueDate = "Choose a target due date.";
  else if (!isValidISODate(form.dueDate)) errors.dueDate = "Enter a valid date.";
  else if (form.dueDate < today) errors.dueDate = "The due date cannot be in the past.";
  if (!form.teamId) errors.teamId = "Choose a team.";
  if (!form.description.trim()) errors.description = "Enter a description.";

  return errors;
}

/** One item per line. Trims each line and drops blanks. */
export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toCreateTaskInput(form: CreateTaskFormState): CreateTaskInput {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    projectId: form.projectId,
    teamId: form.teamId,
    projectManagerId: form.projectManagerId,
    assigneeIds: [...form.assigneeIds],
    dueDate: form.dueDate,
    priority: form.priority,
    status: form.status,
    sections: {
      objective: form.objective.trim(),
      context: form.context.trim(),
      requirements: splitLines(form.requirements),
      steps: splitLines(form.steps),
      deliverables: splitLines(form.deliverables),
      acceptanceCriteria: splitLines(form.acceptanceCriteria),
    },
  };
}

/** Formats an ISO date (YYYY-MM-DD) for display, e.g. "Mar 5, 2026". Returns the input if invalid. */
export function formatDueDate(iso: string): string {
  if (!isValidISODate(iso)) return iso;
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
