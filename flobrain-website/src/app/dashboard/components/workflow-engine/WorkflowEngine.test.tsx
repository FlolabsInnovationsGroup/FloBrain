import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WorkflowEngine } from ".";

describe("WorkflowEngine Component", () => {
  it("should render the Workflow Engine title", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("WORKFLOW ENGINE")).toBeDefined();
  });

  it("should render subtitle", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("Recent errors & warnings")).toBeDefined();
  });

  it("should render status badges", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("3 Critical")).toBeDefined();
    expect(screen.getByText("2 Warnings")).toBeDefined();
  });

  it("should render all alert titles", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("Sentiment Analysis - API rate limit exceeded")).toBeDefined();
    expect(screen.getByText("Memory Retrieval Timeout")).toBeDefined();
    expect(screen.getByText("High Memory Usage Detected")).toBeDefined();
    expect(screen.getByText("Failed Webhook Delivery")).toBeDefined();
    expect(screen.getByText("Model Version Deprecated")).toBeDefined();
  });

  it("should render component tags", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("sentiment-analysis:v2")).toBeDefined();
    expect(screen.getByText("memory-engine")).toBeDefined();
    expect(screen.getByText("user-context-builder")).toBeDefined();
    expect(screen.getByText("webhook-dispatcher")).toBeDefined();
    expect(screen.getByText("llm-router")).toBeDefined();
  });

  it("should render timestamps", () => {
    render(<WorkflowEngine />);
    expect(screen.getAllByText("2 min ago").length).toBeGreaterThan(0);
    expect(screen.getAllByText("19 min ago").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 hour ago").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3 hours ago").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5 hours ago").length).toBeGreaterThan(0);
  });

  it("should render View Details links", () => {
    render(<WorkflowEngine />);
    const viewDetailsLinks = screen.getAllByText("View Details →");
    expect(viewDetailsLinks.length).toBe(5);
  });

  it("should render footer button", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("View All Errors & Logs")).toBeDefined();
  });

  it("should render the correct number of alert items", () => {
    const { container } = render(<WorkflowEngine />);
    const alerts = container.querySelectorAll(
      '[style*="var(--fb-dashboard-critical-bg)"], [style*="var(--fb-dashboard-warning-bg)"]'
    );
    expect(alerts.length).toBeGreaterThan(0);
  });
});
