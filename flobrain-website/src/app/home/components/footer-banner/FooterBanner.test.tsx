import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FooterBanner } from ".";

describe("FooterBanner Component", () => {
  it("should render the main title correctly", () => {
    render(<FooterBanner />);
    expect(screen.getByText("One Brain, Infinite Possibilities")).toBeDefined();
  });

  it("should render the description paragraph", () => {
    render(<FooterBanner />);
    expect(
      screen.getByText(/Join thousands of developers building the next generation of intelligent applications/i)
    ).toBeDefined();
  });

  it("should render the four feature pills", () => {
    render(<FooterBanner />);
    expect(screen.getByText("Real-time Sync")).toBeDefined();
    expect(screen.getByText("Cross-Platform")).toBeDefined();
    expect(screen.getByText("Offline Support")).toBeDefined();
    expect(screen.getByText("Privacy-first")).toBeDefined();
  });

});
