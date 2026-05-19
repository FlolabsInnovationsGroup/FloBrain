import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HomeSkeleton } from ".";

describe("HomeSkeleton Component", () => {
  it("should render without crashing", () => {
    const { container } = render(<HomeSkeleton />);
    expect(container).toBeDefined();
  });

  it("should have animate-pulse class for loading animation", () => {
    const { container } = render(<HomeSkeleton />);
    const pulsingElement = container.querySelector(".animate-pulse");
    expect(pulsingElement).toBeDefined();
  });

  it("should render hero section skeleton", () => {
    const { container } = render(<HomeSkeleton />);
    const skeletonElements = container.querySelectorAll(".bg-white\\/10");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("should render workflow step skeletons", () => {
    const { container } = render(<HomeSkeleton />);
    const workflowSteps = container.querySelectorAll(".rounded-full.border-2");
    expect(workflowSteps.length).toBe(3);
  });

  it("should render sidebar sections", () => {
    const { container } = render(<HomeSkeleton />);
    const sidebars = container.querySelectorAll("aside");
    expect(sidebars.length).toBe(2);
  });
});
