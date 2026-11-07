import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import { CreateTaskForm } from "./CreateTaskForm";
import { mockTaskFormOptions } from "./mockTaskOptions";

function setup() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(<CreateTaskForm options={mockTaskFormOptions} onSubmit={onSubmit} onCancel={onCancel} />);
  return { onSubmit, onCancel };
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function detailField(title: string) {
  return screen.getByRole("textbox", { name: title, hidden: true });
}

function fillRequired() {
  change("Task name", "Build onboarding flow");
  change("Project", "project-1"); // prefills team and manager
  change("Target due date", "2099-12-31");
  change("Task description", "Design and build the first-run flow.");
}

describe("CreateTaskForm", () => {
  it("renders every field from the design", () => {
    setup();
    for (const label of [
      "Task name",
      "Project",
      "Project manager",
      "Target due date",
      "Team",
      "Task description",
      "Status",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    for (const title of [
      "Objective",
      "Context",
      "Requirements",
      "Steps",
      "Deliverables",
      "Acceptance Criteria",
    ]) {
      expect(screen.getByRole("button", { name: new RegExp(title) })).toBeInTheDocument();
    }
    expect(screen.getByRole("radio", { name: "High" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Add members" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();
  });

  it("defaults to high priority and active status", () => {
    setup();
    expect(screen.getByRole("radio", { name: "High" })).toBeChecked();
    expect(screen.getByLabelText("Status")).toHaveValue("active");
  });

  it("shows required-field errors and focuses the first invalid field", () => {
    const { onSubmit } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Enter a task name.")).toBeInTheDocument();
    expect(screen.getByText("Choose a project.")).toBeInTheDocument();
    expect(screen.getByText("Choose a project manager.")).toBeInTheDocument();
    expect(screen.getByText("Choose a target due date.")).toBeInTheDocument();
    expect(screen.getByText("Choose a team.")).toBeInTheDocument();
    expect(screen.getByText("Enter a description.")).toBeInTheDocument();

    const title = screen.getByLabelText("Task name");
    expect(title).toHaveFocus();
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAttribute("aria-describedby", "task-title-error");
  });

  it("clears a field's error when it is edited", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));
    expect(screen.getByText("Enter a task name.")).toBeInTheDocument();

    change("Task name", "Something");
    expect(screen.queryByText("Enter a task name.")).not.toBeInTheDocument();
  });

  it("rejects a past due date", () => {
    setup();
    fillRequired();
    change("Target due date", "2000-01-01");
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));
    expect(screen.getByText("The due date cannot be in the past.")).toBeInTheDocument();
  });

  it("prefills team and manager from the project without overriding a prior choice", () => {
    setup();
    change("Project", "project-1");
    expect(screen.getByLabelText("Team")).toHaveValue("team-1");
    expect(screen.getByLabelText("Project manager")).toHaveValue("person-1");

    change("Team", "team-4");
    change("Project", "project-2");
    expect(screen.getByLabelText("Team")).toHaveValue("team-4");
  });

  it("expands and collapses detail sections", () => {
    setup();
    const toggle = screen.getByRole("button", { name: /Objective/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(detailField("Objective")).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(detailField("Objective")).toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("switches priority", () => {
    setup();
    fireEvent.click(screen.getByRole("radio", { name: "High" }));
    expect(screen.getByRole("radio", { name: "High" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Medium" })).not.toBeChecked();
  });

  it("searches, filters by letter, adds and removes members", () => {
    setup();
    const search = screen.getByRole("combobox", { name: "Add members" });
    fireEvent.focus(search);

    fireEvent.change(search, { target: { value: "ben" } });
    expect(screen.getByRole("checkbox", { name: "Ben Lewis" })).toBeVisible();
    expect(screen.queryByRole("checkbox", { name: "Amara Okafor" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Ben Lewis" }));
    const chips = screen.getByRole("list", { name: "Selected members" });
    expect(within(chips).getByText("Ben Lewis")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "C" }));
    expect(screen.getByRole("checkbox", { name: "Ceren Yilmaz" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Ben Lewis" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove Ben Lewis" }));
    expect(screen.queryByRole("list", { name: "Selected members" })).not.toBeInTheDocument();
  });

  it("disables letters that have no members", () => {
    setup();
    expect(screen.getByRole("button", { name: "Q" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "A" })).toBeEnabled();
  });

  it("submits the expected payload and allows no members", () => {
    const { onSubmit } = setup();
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: /Steps/ }));
    fireEvent.change(detailField("Steps"), { target: { value: "Design\n\nBuild" } });
    fireEvent.click(screen.getByRole("radio", { name: "High" }));
    change("Status", "pending");
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Build onboarding flow",
      description: "Design and build the first-run flow.",
      projectId: "project-1",
      teamId: "team-1",
      projectManagerId: "person-1",
      assigneeIds: [],
      dueDate: "2099-12-31",
      priority: "high",
      status: "pending",
      sections: {
        objective: "",
        context: "",
        requirements: [],
        steps: ["Design", "Build"],
        deliverables: [],
        acceptanceCriteria: [],
      },
    });
  });

  it("includes selected members as assigneeIds", () => {
    const { onSubmit } = setup();
    fillRequired();
    fireEvent.focus(screen.getByRole("combobox", { name: "Add members" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Ben Lewis" }));
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(onSubmit.mock.calls[0][0].assigneeIds).toEqual(["person-2"]);
  });

  it("calls onCancel", () => {
    const { onCancel, onSubmit } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
