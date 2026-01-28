import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryActivity } from ".";

// Mock Math.random to have predictable heatmap colors
vi.spyOn(Math, "random").mockReturnValue(0.5);

describe("MemoryActivity Component", () => {
  it("should render the Memory Activity title", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("Memory Activity")).toBeDefined();
  });

  it("should render memory chunks created section", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("Memory chunks created today")).toBeDefined();
    expect(screen.getByText("1,247")).toBeDefined();
    expect(screen.getByText("+23%")).toBeDefined();
  });

  it("should render Memory Usage Heatmap title", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("Memory Usage Heatmap (Last 7 Days)")).toBeDefined();
  });

  it("should render all 7 days of the week", () => {
    render(<MemoryActivity />);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeDefined();
    });
  });

  it("should render time labels", () => {
    render(<MemoryActivity />);
    const timeLabels = ["12am", "6am", "12pm", "6pm", "11pm"];
    timeLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeDefined();
    });
  });

  it("should render memory chunks as a link to /memory", () => {
    render(<MemoryActivity />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/memory");
  });

  it("should render heatmap with 7 rows (days)", () => {
    const { container } = render(<MemoryActivity />);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeDefined();
    });
  });
});
