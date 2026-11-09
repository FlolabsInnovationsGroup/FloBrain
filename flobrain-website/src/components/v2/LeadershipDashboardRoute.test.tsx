import { fireEvent, render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LeadershipDashboardPage from "@/app/(v2)/leadership/dashboard/page";
import LeadershipPreview from "@/app/leadership-preview/page";
import { PageStructure } from "./PageStructure";

const scrollIntoView = vi.fn();

function renderRoute() {
  return render(
    <PageStructure>
      <LeadershipDashboardPage />
    </PageStructure>,
  );
}

function searchFor(value: string) {
  fireEvent.change(screen.getByRole("searchbox"), { target: { value } });
}

function table(name: string) {
  return screen.queryByRole("table", { name });
}

function section(title: string) {
  return within(screen.getByRole("heading", { level: 2, name: title }).closest("section")!);
}

beforeEach(() => {
  scrollIntoView.mockClear();
  HTMLElement.prototype.scrollIntoView = scrollIntoView;
  vi.mocked(usePathname).mockReturnValue("/leadership/dashboard");
});

describe("Leadership Dashboard in the V2 shell", () => {
  it("renders the KPI cards, tables, progress bars and status badges", () => {
    renderRoute();

    for (const [label, value] of [
      ["Total Interns", "24"],
      ["Active Projects", "8"],
      ["Tasks Completed This Week", "37"],
      ["Pending Tasks", "12"],
      ["Project Blockers", "3"],
    ]) {
      expect(within(screen.getByText(label).closest("article")!).getByText(value)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("table")).toHaveLength(3);
    expect(table("TEAM OVERVIEW")).toHaveTextContent("Frontend");
    expect(table("INTERN OVERVIEW")).toHaveTextContent("Demo Intern A");
    expect(table("DEADLINES / MILESTONES")).toHaveTextContent("User Authentication");
    expect(screen.getAllByRole("progressbar")).toHaveLength(6);
    expect(screen.getByText("At risk")).toBeInTheDocument();
    expect(screen.getByText("Away")).toBeInTheDocument();
  });

  it("adapts to the shell without nesting its containers or the V1 navbar", () => {
    renderRoute();

    expect(document.querySelectorAll("main")).toHaveLength(0);
    expect(document.querySelectorAll(".fb-v2-content")).toHaveLength(1);
    expect(document.querySelector(".fb-v2-content .fb-v2-dashboard")).toBeInTheDocument();
    expect(document.querySelector(".fb-v2-preview")).not.toBeInTheDocument();
    expect(document.querySelector(".fb-v2-lead-panel")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });

  it("uses only the shared create links and search", () => {
    renderRoute();

    for (const [name, href] of [
      ["Create Team", "/leadership/teams/new"],
      ["Create Project", "/leadership/projects/new"],
      ["Create Task", "/leadership/tasks/new"],
    ]) {
      expect(screen.getAllByRole("link", { name })).toHaveLength(1);
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
    expect(screen.getAllByRole("searchbox")).toHaveLength(1);
    expect(document.querySelector("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Jump to search result" })).not.toBeInTheDocument();
  });

  it("does not show the demo banner", () => {
    renderRoute();

    expect(screen.queryByText(/demo mode/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mock data/i)).not.toBeInTheDocument();
  });

  it("links each section's VIEW ALL to its full page", () => {
    renderRoute();

    for (const [title, name, href] of [
      ["TEAM OVERVIEW", "View all teams", "/leadership/teams"],
      ["INTERN OVERVIEW", "View all interns", "/leadership/interns"],
      ["DEADLINES / MILESTONES", "View all projects", "/leadership/projects"],
    ]) {
      const link = section(title).getByRole("link", { name });
      expect(link).toHaveTextContent("VIEW ALL");
      expect(link).toHaveAttribute("href", href);
    }
  });

  it("keeps Leadership and Dashboard selected in the shared navigation", () => {
    renderRoute();

    expect(screen.getByRole("link", { name: "LEADERSHIP" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "DASHBOARD" })).toHaveAttribute("aria-current", "page");
  });

  it("filters teams, interns and milestones from the shared search", () => {
    renderRoute();

    searchFor("AT RISK");
    expect(table("TEAM OVERVIEW")).toHaveTextContent("Backend");
    expect(table("TEAM OVERVIEW")).not.toHaveTextContent("Frontend");
    expect(table("INTERN OVERVIEW")).not.toBeInTheDocument();
    expect(table("DEADLINES / MILESTONES")).not.toBeInTheDocument();

    searchFor("Demo Intern B");
    expect(table("TEAM OVERVIEW")).not.toBeInTheDocument();
    expect(table("INTERN OVERVIEW")).toHaveTextContent("Demo Intern B");
    expect(table("INTERN OVERVIEW")).not.toHaveTextContent("Demo Intern A");
    expect(table("DEADLINES / MILESTONES")).not.toBeInTheDocument();

    searchFor("User Authentication");
    expect(table("TEAM OVERVIEW")).not.toBeInTheDocument();
    expect(table("INTERN OVERVIEW")).not.toBeInTheDocument();
    expect(table("DEADLINES / MILESTONES")).toHaveTextContent("User Authentication");

    searchFor("no-such-result");
    expect(screen.getByRole("status")).toHaveTextContent('No matches found for "no-such-result"');

    searchFor("");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(3);
  });

  it("clears on Escape and jumps to the first result on Enter", () => {
    renderRoute();
    const search = screen.getByRole("searchbox");

    fireEvent.keyDown(search, { key: "Enter" });
    expect(scrollIntoView).not.toHaveBeenCalled();

    searchFor("Demo Intern B");
    fireEvent.keyDown(search, { key: "Enter" });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    fireEvent.keyDown(search, { key: "Escape" });
    expect(search).toHaveValue("");
    expect(screen.getAllByRole("table")).toHaveLength(3);
  });
});

describe("Shared search on other V2 routes", () => {
  it("stays typable on Teams and Interns with nothing to jump to", () => {
    for (const path of ["/leadership/teams", "/leadership/interns"]) {
      vi.mocked(usePathname).mockReturnValue(path);
      const { unmount } = render(<PageStructure />);
      const search = screen.getByRole("searchbox");

      searchFor("Frontend");
      expect(search).toHaveValue("Frontend");
      fireEvent.keyDown(search, { key: "Enter" });
      expect(scrollIntoView).not.toHaveBeenCalled();
      fireEvent.keyDown(search, { key: "Escape" });
      expect(search).toHaveValue("");
      unmount();
    }
  });

  it("clears the query when the route changes", () => {
    const { rerender } = render(<PageStructure />);
    searchFor("Frontend");

    vi.mocked(usePathname).mockReturnValue("/leadership/teams");
    rerender(<PageStructure />);

    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("stays hidden on routes without search", () => {
    vi.mocked(usePathname).mockReturnValue("/leadership/projects");
    render(<PageStructure />);

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});

describe("Leadership preview compatibility", () => {
  it("keeps its own page, controls and dialog outside the shell", () => {
    vi.mocked(usePathname).mockReturnValue("/leadership-preview");
    render(<LeadershipPreview />);

    expect(document.querySelectorAll(".fb-v2-preview main.fb-v2-content")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Leadership Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Team" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jump to search result" })).toBeInTheDocument();
    expect(document.querySelectorAll("dialog")).toHaveLength(1);
    expect(screen.getAllByRole("table")).toHaveLength(3);
  });

  it("keeps its demo notice and has no VIEW ALL links", () => {
    vi.mocked(usePathname).mockReturnValue("/leadership-preview");
    render(<LeadershipPreview />);

    expect(screen.getByText(/demo mode: changes use mock data/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view all/i })).not.toBeInTheDocument();
  });
});
