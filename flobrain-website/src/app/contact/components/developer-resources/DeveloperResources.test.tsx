import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DeveloperResources } from ".";

describe("DeveloperResources Component", () => {
  it("should render the Developer Resources heading", () => {
    render(<DeveloperResources />);
    expect(screen.getByText("Developer Resources")).toBeDefined();
  });

  it("should render API Documentation entry", () => {
    render(<DeveloperResources />);
    expect(screen.getByText("API Documentation")).toBeDefined();
    expect(screen.getByText("Complete integration guides")).toBeDefined();
  });

  it("should render System Status entry with uptime badge", () => {
    render(<DeveloperResources />);
    expect(screen.getByText("System Status")).toBeDefined();
    expect(screen.getByText("99.9% Uptime")).toBeDefined();
    expect(screen.getByText("Real-time monitoring")).toBeDefined();
  });

  it("should render GitHub entry", () => {
    render(<DeveloperResources />);
    expect(screen.getByText("GitHub")).toBeDefined();
    expect(screen.getByText("Open source SDKs")).toBeDefined();
  });

  it("should render Discord Community entry", () => {
    render(<DeveloperResources />);
    expect(screen.getByText("Discord Community")).toBeDefined();
    expect(screen.getByText("Join 5,000+ developers")).toBeDefined();
  });

  it("should render all four resource rows", () => {
    const { container } = render(<DeveloperResources />);
    const rows = container.querySelectorAll(".flex.items-center.justify-between");
    expect(rows.length).toBe(4);
  });
});
