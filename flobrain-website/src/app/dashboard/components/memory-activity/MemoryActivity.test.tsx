import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryActivity } from ".";

describe("MemoryActivity Component", () => {
  it("should render the Memory Activity title", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("MEMORY ACTIVITY")).toBeDefined();
  });

  it("should render the subtitle", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("Last 12 weeks")).toBeDefined();
  });

  it("should render TODAY stat card", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("TODAY")).toBeDefined();
    expect(screen.getByText("1,247")).toBeDefined();
    expect(screen.getByText("chunks created")).toBeDefined();
  });

  it("should render THIS WEEK stat card", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("THIS WEEK")).toBeDefined();
    expect(screen.getByText("8,942")).toBeDefined();
    expect(screen.getByText("+2.3%")).toBeDefined();
  });

  it("should render TOTAL stat card", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("TOTAL")).toBeDefined();
    expect(screen.getByText("127.4K")).toBeDefined();
    expect(screen.getByText("all time")).toBeDefined();
  });

  it("should render Usage Heatmap title", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("Usage Heatmap")).toBeDefined();
  });

  it("should render all 7 days of the week", () => {
    render(<MemoryActivity />);
    const days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeDefined();
    });
  });

  it("should render time labels", () => {
    render(<MemoryActivity />);
    const timeLabels = ["12 am", "6 am", "12 pm", "6 pm", "11 pm"];
    timeLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeDefined();
    });
  });

  it("should render intensity legend", () => {
    render(<MemoryActivity />);
    expect(screen.getByText("Less")).toBeDefined();
    expect(screen.getByText("More")).toBeDefined();
  });

  it("should render heatmap with circular indicators", () => {
    const { container } = render(<MemoryActivity />);
    const circles = container.querySelectorAll(".rounded-full");
    // Should have legend circles + heatmap circles (7 days * 24 hours = 168)
    expect(circles.length).toBeGreaterThan(100);
  });
});
