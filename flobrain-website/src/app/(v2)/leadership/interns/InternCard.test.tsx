import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InternCard } from "./InternCard";
import type { Intern } from "./types";

const mockIntern: Intern = {
  id: "1",
  name: "Maya Patel",
  designation: "AI Engineer",
  team: "Team 2",
  project: "FloHealth Buddy",
  hours: 35,
  specialization: "Machine Learning",
};

describe("InternCard", () => {
  it("renders the intern name and designation", () => {
    render(<InternCard intern={mockIntern} />);

    expect(screen.getByRole("heading", { name: "Maya Patel" })).toBeInTheDocument();
    expect(screen.getByText("AI Engineer")).toBeInTheDocument();
  });

  it("renders team, project and weekly hours", () => {
    render(<InternCard intern={mockIntern} />);

    expect(screen.getByText("Team 2")).toBeInTheDocument();
    expect(screen.getByText("FloHealth Buddy")).toBeInTheDocument();
    expect(screen.getByText("35/40")).toBeInTheDocument();
  });

  it("renders the specialization below a divider", () => {
    render(<InternCard intern={mockIntern} />);

    expect(screen.getByText("Specialization")).toBeInTheDocument();
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
  });

  it("shows the profile initials", () => {
    render(<InternCard intern={mockIntern} />);

    expect(screen.getByText("MP")).toBeInTheDocument();
  });
});
