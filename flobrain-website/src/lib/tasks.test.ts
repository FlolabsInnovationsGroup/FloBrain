import { describe, expect, it } from "vitest";
import {
  emptyCreateTaskForm,
  formatDueDate,
  splitLines,
  todayISO,
  toCreateTaskInput,
  validateCreateTask,
  type CreateTaskFormState,
} from "./tasks";

const TODAY = "2026-06-15";

function validForm(overrides: Partial<CreateTaskFormState> = {}): CreateTaskFormState {
  return {
    ...emptyCreateTaskForm(),
    title: "Build onboarding flow",
    projectId: "p1",
    projectManagerId: "m1",
    teamId: "t1",
    dueDate: "2026-07-01",
    description: "Design and build the first-run flow.",
    ...overrides,
  };
}

describe("validateCreateTask", () => {
  it("flags every required field on an empty form", () => {
    const errors = validateCreateTask(emptyCreateTaskForm(), TODAY);
    expect(Object.keys(errors).sort()).toEqual(
      ["description", "dueDate", "projectId", "projectManagerId", "teamId", "title"].sort()
    );
  });

  it("accepts a complete form with no members and empty optional sections", () => {
    expect(validateCreateTask(validForm({ assigneeIds: [] }), TODAY)).toEqual({});
  });

  it("treats whitespace-only text as empty", () => {
    const errors = validateCreateTask(validForm({ title: "   ", description: "\n " }), TODAY);
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
  });

  it("rejects a title over 120 characters", () => {
    const errors = validateCreateTask(validForm({ title: "a".repeat(121) }), TODAY);
    expect(errors.title).toMatch(/120/);
  });

  it("rejects a past due date but allows today", () => {
    expect(validateCreateTask(validForm({ dueDate: "2026-06-14" }), TODAY).dueDate).toMatch(/past/);
    expect(validateCreateTask(validForm({ dueDate: TODAY }), TODAY).dueDate).toBeUndefined();
  });

  it("rejects a malformed or impossible date", () => {
    expect(validateCreateTask(validForm({ dueDate: "2026-02-30" }), TODAY).dueDate).toMatch(
      /valid/
    );
    expect(validateCreateTask(validForm({ dueDate: "06/15/2026" }), TODAY).dueDate).toMatch(
      /valid/
    );
  });
});

describe("splitLines", () => {
  it("trims lines and drops blanks", () => {
    expect(splitLines("  one \n\n two\r\n   \nthree")).toEqual(["one", "two", "three"]);
  });

  it("returns an empty array for empty text", () => {
    expect(splitLines("")).toEqual([]);
  });
});

describe("toCreateTaskInput", () => {
  it("maps the form to the payload with trimmed text and split list sections", () => {
    const input = toCreateTaskInput(
      validForm({
        title: "  Build onboarding flow  ",
        objective: " Ship v1 ",
        steps: "Design\n\nBuild",
        requirements: "Responsive",
        assigneeIds: ["u1", "u2"],
        priority: "high",
        status: "pending",
      })
    );

    expect(input).toEqual({
      title: "Build onboarding flow",
      description: "Design and build the first-run flow.",
      projectId: "p1",
      teamId: "t1",
      projectManagerId: "m1",
      assigneeIds: ["u1", "u2"],
      dueDate: "2026-07-01",
      priority: "high",
      status: "pending",
      sections: {
        objective: "Ship v1",
        context: "",
        requirements: ["Responsive"],
        steps: ["Design", "Build"],
        deliverables: [],
        acceptanceCriteria: [],
      },
    });
  });

  it("does not include server-owned fields", () => {
    const input = toCreateTaskInput(validForm());
    expect(input).not.toHaveProperty("id");
    expect(input).not.toHaveProperty("createdBy");
    expect(input).not.toHaveProperty("createdAt");
  });

  it("copies assigneeIds instead of sharing the array", () => {
    const form = validForm({ assigneeIds: ["u1"] });
    const input = toCreateTaskInput(form);
    expect(input.assigneeIds).not.toBe(form.assigneeIds);
  });
});

describe("date helpers", () => {
  it("formats today's local date as YYYY-MM-DD", () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("formats an ISO date for display and passes invalid input through", () => {
    expect(formatDueDate("2026-03-05")).toBe("Mar 5, 2026");
    expect(formatDueDate("nope")).toBe("nope");
  });
});
