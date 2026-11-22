import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import LeadershipDashboard from "./LeadershipDashboard";

const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  HTMLElement.prototype.scrollIntoView = scrollIntoView;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    fireEvent(this, new Event("close"));
  };
});

function field(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function metric(label: string) {
  return within(screen.getByText(label).closest("article")!);
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
}

describe("Leadership preview behavior", () => {
  it("keeps the initial data, filters by status, jumps to matches and clears search", () => {
    render(<LeadershipDashboard />);
    expect(metric("Total Interns").getByText("24")).toBeInTheDocument();
    expect(metric("Tasks Completed This Week").getByText("37")).toBeInTheDocument();
    expect(metric("Project Blockers").getByText("3")).toBeInTheDocument();
    field("Search by name", "AT RISK");
    expect(screen.getByRole("table", { name: "TEAM OVERVIEW" })).toHaveTextContent("Backend");
    expect(screen.queryByRole("table", { name: "INTERN OVERVIEW" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Jump to search result" }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    field("Search by name", "no-such-result");
    expect(screen.getByRole("status")).toHaveTextContent("No matches found");
    field("Search by name", "");
    expect(screen.getAllByRole("table")).toHaveLength(3);
  });

  it("creates a team, project and task while keeping KPI and intern updates", () => {
    render(<LeadershipDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Create Team" }));
    field("Team name", "Experiment Team");
    field("Team lead", "Maria");
    submit();
    expect(screen.getByRole("table", { name: "TEAM OVERVIEW" })).toHaveTextContent(
      "Experiment Team"
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    field("Project name", "Experiment Project");
    field("Team", "Experiment Team");
    field("Target date", "2026-11-10");
    submit();
    expect(metric("Active Projects").getByText("9")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "DEADLINES / MILESTONES" })).toHaveTextContent(
      "Nov 10, 2026"
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));
    field("Task title", "Experiment Task");
    field("Project", "Experiment Project");
    field("Assigned intern", "Demo Intern A");
    submit();
    expect(metric("Pending Tasks").getByText("13")).toBeInTheDocument();
    expect(screen.getByText("Experiment Task")).toBeInTheDocument();
    const row = screen.getByText("Demo Intern A").closest("tr")!;
    expect(within(row).getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    field("Search by name", "Experiment Task");
    fireEvent.click(screen.getByRole("button", { name: "Jump to search result" }));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("keeps duplicate validation and cancel behavior", () => {
    render(<LeadershipDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Create Team" }));
    field("Team name", "frontend");
    field("Team lead", "Maria");
    submit();
    expect(screen.getByRole("alert")).toHaveTextContent("This team already exists.");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    field("Project name", "User Authentication");
    field("Team", "Backend");
    field("Target date", "2026-11-10");
    submit();
    expect(screen.getByRole("alert")).toHaveTextContent("This project already exists.");
    expect(metric("Active Projects").getByText("8")).toBeInTheDocument();
  });
});
