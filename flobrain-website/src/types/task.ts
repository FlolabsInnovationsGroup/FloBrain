// Shared V2 task types. Create Task, View Tasks and Task Details all build on these.
// Nothing here is persisted yet: there is no backend task model, so shapes are the agreed contract.

export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "active" | "pending" | "overdue" | "inactive" | "completed";

export type TaskDetailSections = {
  objective: string;
  context: string;
  requirements: string[];
  steps: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
};

export type TaskPerson = { id: string; name: string };

/** A project or team the task belongs to. */
export type TaskReference = { id: string; name: string };

/** A dropdown entry. */
export type TaskOption = { id: string; label: string };

/**
 * Shape the backend will return (GET /api/tasks/ and /api/tasks/:id/).
 * Used by View Tasks and Task Details, which can show names without extra lookups.
 */
export type Task = {
  id: string;
  title: string;
  description: string;
  project: TaskReference;
  team: TaskReference;
  projectManager: TaskPerson;
  /** "Created By". Set by the backend from the signed-in user, never sent by the form. */
  createdBy: TaskPerson;
  /** "Assigned To". These are the members picked in the form's "Add members" field. */
  assignedTo: TaskPerson[];
  /** ISO date, YYYY-MM-DD. */
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  sections: TaskDetailSections;
  /** ISO datetime, set by the backend. */
  createdAt: string;
  /** ISO datetime, set by the backend. */
  updatedAt: string;
};

/**
 * What Create Task submits (future body of POST /api/tasks/). IDs only, and no server-owned
 * fields such as id, createdBy or timestamps.
 */
export type CreateTaskInput = {
  title: string;
  description: string;
  projectId: string;
  teamId: string;
  projectManagerId: string;
  /** Becomes `Task.assignedTo`. May be empty: assigning members is optional. */
  assigneeIds: string[];
  /** ISO date, YYYY-MM-DD. */
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  sections: TaskDetailSections;
};
