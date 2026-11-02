import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PageStructure } from "./PageStructure";

describe("PageStructure", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/leadership/teams");
  });

  it("highlights Leadership and the current leadership page", () => {
    render(<PageStructure />);

    expect(screen.getByRole("link", { name: "LEADERSHIP" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "TEAMS" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "DASHBOARD" })).toHaveAttribute("href", "/leadership");
    expect(screen.getByRole("link", { name: "ACTIVITY LOGS" })).toHaveAttribute(
      "href",
      "/leadership/activity",
    );
    expect(document.querySelector("[data-slot='actions']")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Team" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Project" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search by name")).toBeInTheDocument();
  });

  it("hides the leadership row outside leadership routes", () => {
    vi.mocked(usePathname).mockReturnValue("/my-docs");
    render(<PageStructure />);

    expect(screen.queryByRole("navigation", { name: "Leadership" })).not.toBeInTheDocument();
    expect(document.querySelector("[data-slot='actions']")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DOCS" })).toHaveAttribute("aria-current", "page");
  });

  it("hides search on leadership pages that do not use it", () => {
    vi.mocked(usePathname).mockReturnValue("/leadership/projects");
    render(<PageStructure />);

    expect(screen.getByRole("button", { name: "Create Team" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Search by name")).not.toBeInTheDocument();
  });

  it("exposes the content and side panel slots", () => {
    render(
      <PageStructure
        leftPanel={<p>Left slot</p>}
        rightPanel={<p>Right slot</p>}
      >
        <p>Main slot</p>
      </PageStructure>,
    );

    expect(document.querySelector("[data-slot='left-rail']")).not.toBeInTheDocument();
    expect(screen.getByText("Left slot")).toBeInTheDocument();
    expect(screen.getByText("Right slot")).toBeInTheDocument();
    expect(screen.getByText("Main slot")).toBeInTheDocument();
  });

  it("opens an empty create panel in the center content when a create button is clicked", () => {
    render(
      <PageStructure>
        <p>Main slot</p>
      </PageStructure>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));

    expect(screen.queryByText("Main slot")).not.toBeInTheDocument();
    expect(document.querySelector("[data-slot='create-panel']")).toHaveAttribute(
      "data-create",
      "project",
    );
    expect(screen.getByRole("button", { name: "Create Project" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
