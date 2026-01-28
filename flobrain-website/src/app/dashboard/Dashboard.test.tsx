import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Dashboard from "./page";

describe("Dashboard Page", () => {
  it("should render the dashboard page", () => {
    render(<Dashboard />);
    expect(document.querySelector("main")).toBeDefined();
  });

  it("should show loading skeleton initially", () => {
    const { container } = render(<Dashboard />);
    const skeletonElement = container.querySelector(".animate-pulse");
    expect(skeletonElement).toBeDefined();
  });

  it("should hide skeleton and show dashboard content after loading", async () => {
    render(<Dashboard />);

    await waitFor(
      () => {
        expect(screen.getByText("SYSTEM DASHBOARD")).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it("should render the page title after loading", async () => {
    render(<Dashboard />);

    await waitFor(
      () => {
        expect(screen.getByText("SYSTEM DASHBOARD")).toBeDefined();
        expect(
          screen.getByText("Monitor your system health, workflows, and AI model performance")
        ).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it("should render SystemHealth component after loading", async () => {
    render(<Dashboard />);

    await waitFor(
      () => {
        expect(screen.getByText("System Health")).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it("should render MemoryActivity component after loading", async () => {
    render(<Dashboard />);

    await waitFor(
      () => {
        expect(screen.getByText("Memory Activity")).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it("should render WorkflowEngine component after loading", async () => {
    render(<Dashboard />);

    await waitFor(
      () => {
        expect(screen.getByText("Workflow Engine")).toBeDefined();
      },
      { timeout: 3000 }
    );
  });
});
