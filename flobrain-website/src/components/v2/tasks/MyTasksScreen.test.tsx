import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { Task } from "@/types/task";
import { MyTasksScreen } from "./MyTasksScreen";
import { mockMyTasks } from "./mockMyTasks";

const NOW = new Date(2026, 0, 10, 12);

function daysAgo(days: number): string {
  return new Date(2026, 0, 10 - days, 10).toISOString();
}

const tasks: Task[] = [
  {
    ...mockMyTasks[0],
    id: "task-today",
    updatedAt: daysAgo(0),
  },
  {
    ...mockMyTasks[1],
    id: "task-two-days",
    updatedAt: daysAgo(2),
  },
];

describe("MyTasksScreen", () => {
  it("renders the requested columns and task rows", () => {
    render(<MyTasksScreen tasks={tasks} now={NOW} />);

    for (const label of ["Task", "Team", "Project", "Assignee", "Last accessed", "Status"]) {
      expect(screen.getByRole("columnheader", { name: label })).toBeInTheDocument();
    }

    expect(screen.getByText(tasks[0].title)).toBeInTheDocument();
    expect(screen.getAllByText("Design Team").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Brand Refresh").length).toBeGreaterThan(0);
    expect(screen.getAllByTitle("Amara Okafor").length).toBeGreaterThan(0);
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
    expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
  });

  it("shows three overlapping assignee circles and summarizes the rest", () => {
    const withFourAssignees: Task = {
      ...tasks[1],
      assignedTo: [...tasks[1].assignedTo, { id: "person-extra", name: "Zoe Adams" }],
    };

    render(<MyTasksScreen tasks={[withFourAssignees]} now={NOW} />);

    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByTitle("Zoe Adams")).toBeInTheDocument();
    expect(screen.getAllByTitle(/./)).toHaveLength(4);
    expect(screen.getByLabelText("1 more assignee")).toBeInTheDocument();
  });

  it("filters rows by team and project", () => {
    render(<MyTasksScreen tasks={tasks} now={NOW} />);

    fireEvent.change(screen.getByLabelText("Filter by teams"), { target: { value: "team-1" } });
    expect(screen.queryByText(tasks[0].title)).not.toBeInTheDocument();
    expect(screen.getByText(tasks[1].title)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter by projects"), {
      target: { value: "project-4" },
    });
    expect(screen.getByText("No tasks match these filters.")).toBeInTheDocument();
  });

  it("shows an empty state when there are no tasks", () => {
    render(<MyTasksScreen tasks={[]} now={NOW} />);
    expect(screen.getByText("No tasks match these filters.")).toBeInTheDocument();
  });
});
