import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemorySkeleton } from ".";

describe("MemorySkeleton Component", () => {
  it("should render without crashing", () => {
    const { container } = render(<MemorySkeleton />);
    expect(container).toBeDefined();
  });

  it("should have animate-pulse class for loading animation", () => {
    const { container } = render(<MemorySkeleton />);
    const pulsingElement = container.querySelector(".animate-pulse");
    expect(pulsingElement).toBeDefined();
  });

  it("should render filter and search icons", () => {
    const { container } = render(<MemorySkeleton />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should render memory types legend with 4 items", () => {
    const { container } = render(<MemorySkeleton />);
    const legendItems = container.querySelectorAll("[data-testid^='legend-']");
    expect(legendItems.length).toBe(4);
  });

  it("should render 8 simulated graph nodes", () => {
    const { container } = render(<MemorySkeleton />);
    const nodes = container.querySelectorAll("[data-testid^='node-']");
    expect(nodes.length).toBe(8);
  });

  it("should use memory page background", () => {
    const { getByTestId } = render(<MemorySkeleton />);
    const root = getByTestId("memory-skeleton-root");
    expect(root.className).toContain("fb-memory-page");
  });
});
