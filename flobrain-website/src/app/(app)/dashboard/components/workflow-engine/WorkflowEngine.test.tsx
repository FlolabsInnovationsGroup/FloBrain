import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WorkflowEngine } from ".";

describe("WorkflowEngine Component", () => {
  it("should render the Workflow Engine title", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("Workflow Engine")).toBeDefined();
  });

  it("should render Recent Errors section title", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("Recent Errors")).toBeDefined();
  });

  it("should render all error titles", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("Sentiment Analysis")).toBeDefined();
    expect(screen.getByText("Image Recognition")).toBeDefined();
  });

  it("should render all error descriptions", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("Model timeout after 30s - retrying with fallback")).toBeDefined();
    expect(screen.getByText("Invalid image format - preprocessing failed")).toBeDefined();
  });

  it("should render all error timestamps", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("5 minutes ago")).toBeDefined();
    expect(screen.getByText("12 minutes ago")).toBeDefined();
  });

  it("should render the correct number of error items", () => {
    render(<WorkflowEngine />);
    expect(screen.getByText("Sentiment Analysis")).toBeDefined();
    expect(screen.getByText("Image Recognition")).toBeDefined();
  });
});
