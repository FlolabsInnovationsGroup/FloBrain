import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TeamCard } from ".";
import type { Team } from "../../types";

const mockTeam: Team = {
  id: "1",
  name: "DESIGN",
  lead: "Ceren Genc",
  description: "UX Research, Product Design, Prototyping & Visual Identity",
  progress: 82,
  memberCount: 8,
  completedTasks: 14,
  totalTasks: 18,
};

describe("TeamCard", () => {
  it("renders team name, lead, and description", () => {
    render(<TeamCard team={mockTeam} />);

    expect(screen.getByRole("heading", { name: "DESIGN" })).toBeInTheDocument();
    expect(screen.getByText("Ceren Genc")).toBeInTheDocument();
    expect(
      screen.getByText("UX Research, Product Design, Prototyping & Visual Identity")
    ).toBeInTheDocument();
  });

  it("renders progress, member count, and completed tasks", () => {
    render(<TeamCard team={mockTeam} />);

    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "DESIGN progress" })).toHaveAttribute(
      "aria-valuenow",
      "82"
    );
    expect(screen.getByText("8 members")).toBeInTheDocument();
    expect(screen.getByText("14/18 tasks done")).toBeInTheDocument();
  });

  it("uses singular member label when there is one member", () => {
    render(<TeamCard team={{ ...mockTeam, memberCount: 1 }} />);

    expect(screen.getByText("1 member")).toBeInTheDocument();
  });

  it("links to the team detail page", () => {
    render(<TeamCard team={mockTeam} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/teams/1");
  });
});
