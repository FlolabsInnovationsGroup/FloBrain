import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TeamsOverview } from "./teams-overview";
import { mockTeams } from "./mockData";

describe("TeamsOverview", () => {
  it("renders a card for each mock team", () => {
    render(<TeamsOverview />);

    mockTeams.forEach((team) => {
      expect(screen.getByRole("heading", { name: team.name })).toBeInTheDocument();
      expect(screen.getByText(team.lead)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: new RegExp(team.name) })).toHaveAttribute(
        "href",
        `/teams/${team.id}`
      );
    });
  });
});
