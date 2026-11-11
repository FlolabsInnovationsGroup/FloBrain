import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLeadershipSearch } from "./LeadershipSearch";
import { PageStructure } from "./PageStructure";

function SearchQuery() {
  const { query } = useLeadershipSearch();
  return <p>Query: {query}</p>;
}

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
    expect(screen.getByRole("link", { name: "LEADERSHIP" })).toHaveAttribute(
      "href",
      "/leadership/dashboard",
    );
    expect(screen.getByRole("link", { name: "DASHBOARD" })).toHaveAttribute(
      "href",
      "/leadership/dashboard",
    );
    expect(screen.getByRole("link", { name: "ACTIVITY LOGS" })).toHaveAttribute(
      "href",
      "/leadership/activity",
    );
    expect(document.querySelector("[data-slot='actions']")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create Team" })).toHaveAttribute(
      "href",
      "/leadership/teams/new",
    );
    expect(screen.getByRole("link", { name: "Create Project" })).toHaveAttribute(
      "href",
      "/leadership/projects/new",
    );
    expect(screen.getByRole("link", { name: "Create Task" })).toHaveAttribute(
      "href",
      "/leadership/tasks/new",
    );
    expect(screen.getByPlaceholderText("Search by name")).toBeInTheDocument();
  });

  it("hides the leadership row outside leadership routes", () => {
    vi.mocked(usePathname).mockReturnValue("/docs");
    render(<PageStructure />);

    expect(screen.queryByRole("navigation", { name: "Leadership" })).not.toBeInTheDocument();
    expect(document.querySelector("[data-slot='actions']")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DOCS" })).toHaveAttribute("aria-current", "page");
  });

  it("hides search on leadership pages that do not use it", () => {
    vi.mocked(usePathname).mockReturnValue("/leadership/projects");
    render(<PageStructure />);

    expect(screen.getByRole("link", { name: "Create Team" })).toBeInTheDocument();
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

  it("marks the create action link active on its route", () => {
    vi.mocked(usePathname).mockReturnValue("/leadership/projects/new");
    render(
      <PageStructure>
        <p>Main slot</p>
      </PageStructure>,
    );

    expect(screen.getByText("Main slot")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create Project" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Create Team" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByPlaceholderText("Search by name")).not.toBeInTheDocument();
  });

  it("shares the toolbar search with the page content", () => {
    vi.mocked(usePathname).mockReturnValue("/leadership/interns");
    render(
      <PageStructure>
        <SearchQuery />
      </PageStructure>,
    );

    fireEvent.change(screen.getByPlaceholderText("Search by name"), {
      target: { value: "claudia" },
    });

    expect(screen.getByText("Query: claudia")).toBeInTheDocument();
  });
});
