import { render, screen } from "@testing-library/react";
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
    expect(screen.getByRole("link", { name: "My TASKS" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "ACTIVITY LOGS" })).toHaveAttribute(
      "href",
      "/leadership/activity",
    );
    expect(document.querySelector("[data-slot='actions']")).toBeInTheDocument();
  });

  it("hides the leadership row outside leadership routes", () => {
    vi.mocked(usePathname).mockReturnValue("/my-docs");
    render(<PageStructure />);

    expect(screen.queryByRole("navigation", { name: "Leadership" })).not.toBeInTheDocument();
    expect(document.querySelector("[data-slot='actions']")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My DOCS" })).toHaveAttribute("aria-current", "page");
  });

  it("exposes the content and side panel slots", () => {
    render(
      <PageStructure
        leftRail={<p>Rail slot</p>}
        leftPanel={<p>Left slot</p>}
        rightPanel={<p>Right slot</p>}
      >
        <p>Main slot</p>
      </PageStructure>,
    );

    expect(screen.getByText("Rail slot")).toBeInTheDocument();
    expect(screen.getByText("Left slot")).toBeInTheDocument();
    expect(screen.getByText("Right slot")).toBeInTheDocument();
    expect(screen.getByText("Main slot")).toBeInTheDocument();
  });
});
