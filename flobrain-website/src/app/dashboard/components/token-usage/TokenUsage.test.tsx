import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TokenUsage } from "./index";

describe("TokenUsage Component", () => {
  it("should render the token usage component", () => {
    const { container } = render(<TokenUsage />);
    expect(container).toBeDefined();
  });

  it("should display the TOKEN USAGE title", () => {
    render(<TokenUsage />);
    expect(screen.getByText("TOKEN USAGE")).toBeDefined();
  });

  it("should display the subtitle 'Last 7 days'", () => {
    render(<TokenUsage />);
    expect(screen.getByText("Last 7 days")).toBeDefined();
  });

  it("should display the token count", () => {
    render(<TokenUsage />);
    expect(screen.getByText("2,847,392")).toBeDefined();
  });

  it("should display the percentage change", () => {
    render(<TokenUsage />);
    expect(screen.getByText("+18%")).toBeDefined();
  });

  it("should display the comparison text", () => {
    render(<TokenUsage />);
    expect(screen.getByText("vs. last week")).toBeDefined();
  });

  it("should render the sparkline chart", () => {
    const { container } = render(<TokenUsage />);
    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeDefined();
  });

  it("should render the chart path", () => {
    const { container } = render(<TokenUsage />);
    const pathElement = container.querySelector("path");
    expect(pathElement).toBeDefined();
  });
});
