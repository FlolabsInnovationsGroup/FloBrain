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
    expect(
      screen.getByRole("heading", { name: "Update Product Structure and Web Experience" })
    ).toBeInTheDocument();
    expect(screen.getByText("Claudia L. + 1")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("UX/UI Design")).toBeInTheDocument();
    expect(screen.getByText("FloHealth")).toBeInTheDocument();
  });

  it("expands a detail section from Create Task", () => {
    render(<TaskDetailsScreen task={mockTasks[0]} />);
    const toggle = screen.getByRole("button", { name: /Objective/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Ship a clearer product structure/i)).toBeVisible();
  });

  it("renders collaboration panels and meeting details", () => {
    render(<TaskDetailsScreen task={mockTasks[0]} />);
    expect(screen.getByRole("button", { name: /Progress Updates \/ WIP/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Brainwriting/i })).toBeInTheDocument();
    expect(screen.getByText("Zoom Login")).toBeInTheDocument();
    expect(screen.getByText("zoom.buddy@flolabsinnovations.com")).toBeInTheDocument();
    expect(screen.getByText("7Usd4VR!2")).toBeInTheDocument();
  });

  it("toggles collaboration panels between + and − with input fields", () => {
    render(<TaskDetailsScreen task={mockTasks[0]} />);
    const toggle = screen.getByRole("button", { name: /Progress Updates \/ WIP/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("+");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("−");
    expect(screen.getByLabelText("Files / links")).toBeVisible();
    expect(screen.getByLabelText("Progress")).toBeVisible();
    expect(screen.getByLabelText("Next steps")).toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("+");
  });
});
