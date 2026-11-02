import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ViewTasksScreen } from "./ViewTasksScreen";
import { mockTasks } from "./mockTasks";

describe("ViewTasksScreen", () => {
  it("renders the confirmed meeting columns and task rows", () => {
    render(<ViewTasksScreen tasks={mockTasks} />);

    expect(screen.getByRole("heading", { name: /TASKS: FLOHEALTH/i })).toBeInTheDocument();
    for (const label of ["TASK", "Created by:", "Assigned to:", "STATUS", "DUE DATE"]) {
      expect(screen.getByRole("columnheader", { name: label })).toBeInTheDocument();
    }

    expect(screen.getByRole("link", { name: "Update Product Structure" })).toHaveAttribute(
      "href",
      "/leadership/tasks/task-1"
    );
    expect(screen.getByText("Mohamed A.")).toBeInTheDocument();
    expect(screen.getAllByText("Claudia L., Serina Z.").length).toBeGreaterThan(0);
  });

  it("filters rows by status", () => {
    render(
      <ViewTasksScreen
        tasks={[
          { ...mockTasks[0], status: "active" },
          { ...mockTasks[1], id: "task-pending", status: "pending", title: "Pending Review" },
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText("Filter tasks by status"), {
      target: { value: "pending" },
    });

    expect(screen.getByRole("link", { name: "Pending Review" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Update Product Structure" })
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    render(<ViewTasksScreen tasks={[]} />);
    expect(screen.getByText("No tasks match this filter.")).toBeInTheDocument();
  });
});
