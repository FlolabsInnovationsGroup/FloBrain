import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { TaskDetailsScreen } from "./TaskDetailsScreen";
import { mockTasks } from "./mockTasks";

describe("TaskDetailsScreen", () => {
  it("starts at Back to tasks and shows creation-consistent fields", () => {
    render(<TaskDetailsScreen task={mockTasks[0]} />);

    expect(screen.getByRole("link", { name: /Back to tasks/i })).toHaveAttribute(
      "href",
      "/leadership/tasks"
    );
    expect(screen.getByRole("heading", { name: "Update Product Structure" })).toBeInTheDocument();
    expect(screen.getByText("Claudia L. + 1")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("UX/UI Design")).toBeInTheDocument();
    expect(screen.getByText("FloHealth")).toBeInTheDocument();
    expect(screen.getByText(/Restructure the product information/i)).toBeInTheDocument();
  });

  it("expands a detail section from Create Task", () => {
    render(<TaskDetailsScreen task={mockTasks[0]} />);
    const toggle = screen.getByRole("button", { name: /Objective/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Ship a clearer product structure/i)).toBeVisible();
  });

  it("renders placeholder collaboration panels for future backend work", () => {
    render(<TaskDetailsScreen task={mockTasks[0]} />);
    expect(screen.getByRole("button", { name: /Progress Updates \/ WIP/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Brainwriting/i })).toBeInTheDocument();
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(0);
  });
});
