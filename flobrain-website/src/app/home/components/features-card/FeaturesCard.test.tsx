import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FeaturesCard } from ".";

describe("FeaturesCard Component", () => {
  const mockProps = {
    icon: <span data-testid="mock-icon">Icon</span>,
    title: "Test Title",
    description: "Test Description",
    color: "#FF0000",
  };

  it("should render title and description correctly", () => {
    render(<FeaturesCard {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeDefined();
    expect(screen.getByText(mockProps.description)).toBeDefined();
  });

  it("should render the provided icon", () => {
    render(<FeaturesCard {...mockProps} />);
    expect(screen.getByTestId("mock-icon")).toBeDefined();
  });

  it("should apply the correct dynamic background color", () => {
    render(<FeaturesCard {...mockProps} />);
    const iconContainer = screen.getByTestId("mock-icon").parentElement;

    const style = iconContainer?.getAttribute("style");

    expect(style).toContain("color-mix(in srgb");
    expect(style).toContain("rgb(255, 0, 0)");
  });
});
