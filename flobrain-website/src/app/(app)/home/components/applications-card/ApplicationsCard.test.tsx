import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ApplicationsCard } from ".";

describe("ApplicationsCard Component", () => {
  const mockProps = {
    icon: <span data-testid="mock-icon">Icon</span>,
    title: "Test Application",
    description: "Test Description",
    tags: ["React", "TypeScript", "Tailwind"],
  };

  it("should render title and description correctly", () => {
    render(<ApplicationsCard {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeDefined();
    expect(screen.getByText(mockProps.description)).toBeDefined();
  });

  it("should render the provided icon", () => {
    render(<ApplicationsCard {...mockProps} />);
    expect(screen.getByTestId("mock-icon")).toBeDefined();
  });

  it("should render all tags provided", () => {
    render(<ApplicationsCard {...mockProps} />);
    mockProps.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeDefined();
    });
  });

  it("should render the correct number of tag elements", () => {
    render(<ApplicationsCard {...mockProps} />);
    const tags = screen.getAllByText(/React|TypeScript|Tailwind/);
    expect(tags).toHaveLength(3);
  });
});
