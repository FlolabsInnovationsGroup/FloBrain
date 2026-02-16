import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FooterBanner } from ".";

vi.mock("../../constants", () => ({
  possibilities: ["Mock Item 1", "Mock Item 2", "Mock Item 3"],
}));

describe("FooterBanner Component", () => {
  it("should render the main title correctly", () => {
    render(<FooterBanner />);
    expect(screen.getByText("One Brain, Infinite Possibilities")).toBeDefined();
  });

  it("should render the description paragraph", () => {
    render(<FooterBanner />);
    expect(screen.getByText(/Whether you're using a wearable AI assistant/i)).toBeDefined();
  });

  it("should render the list of possibilities based on data", () => {
    render(<FooterBanner />);

    expect(screen.getByText("Mock Item 1")).toBeDefined();
    expect(screen.getByText("Mock Item 2")).toBeDefined();
    expect(screen.getByText("Mock Item 3")).toBeDefined();
  });

  it("should render the correct number of list items", () => {
    render(<FooterBanner />);
    const items = screen.getAllByText(/Mock Item/);
    expect(items).toHaveLength(3);
  });
});
