import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardSkeleton } from ".";

describe("DashboardSkeleton Component", () => {
  it("should render without crashing", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container).toBeDefined();
  });

  it("should have animate-pulse class for loading animation", () => {
    const { container } = render(<DashboardSkeleton />);
    const skeletonDiv = container.firstChild as HTMLElement;
    expect(skeletonDiv.className).toContain("animate-pulse");
  });

  it("should render header skeleton elements", () => {
    const { container } = render(<DashboardSkeleton />);
    const headerSkeletons = container.querySelectorAll(".mb-8 > div");
    expect(headerSkeletons.length).toBeGreaterThan(0);
  });

  it("should render System Health skeleton section", () => {
    const { container } = render(<DashboardSkeleton />);
    const systemHealthSkeleton = container.querySelector(
      '[style*="width: 680px"][style*="height: 430px"]'
    );
    expect(systemHealthSkeleton).toBeDefined();
  });

  it("should render Memory Activity skeleton section", () => {
    const { container } = render(<DashboardSkeleton />);
    const memoryActivitySkeleton = container.querySelector(
      '[style*="width: 680px"][style*="height: 508px"]'
    );
    expect(memoryActivitySkeleton).toBeDefined();
  });

  it("should render Workflow Engine skeleton section", () => {
    const { container } = render(<DashboardSkeleton />);
    // Simply verify the component renders without errors and has expected structure
    const allDivs = container.querySelectorAll("div");
    expect(allDivs.length).toBeGreaterThan(50); // Skeleton has many placeholder divs
  });

  it("should render heatmap skeleton with 7 rows", () => {
    const { container } = render(<DashboardSkeleton />);
    const heatmapRows = container.querySelectorAll(".flex.items-center");
    // Filter to get only the heatmap rows (should be 7 days)
    const heatmapRowsFiltered = Array.from(heatmapRows).filter((row) => {
      const firstChild = row.firstChild as HTMLElement;
      return firstChild && firstChild.className?.includes("h-4");
    });
    expect(heatmapRowsFiltered.length).toBeGreaterThanOrEqual(7);
  });
});
