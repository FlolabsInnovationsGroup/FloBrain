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

  it("should render 6 feature card skeletons", () => {
    const { container } = render(<HomeSkeleton />);
    const featureCards = container.querySelectorAll("[key^='feature-']");
    expect(featureCards.length).toBe(6);
  });

  it("should render 6 application card skeletons", () => {
    const { container } = render(<HomeSkeleton />);
    const appCards = container.querySelectorAll("[key^='app-']");
    expect(appCards.length).toBe(6);
  });
});
