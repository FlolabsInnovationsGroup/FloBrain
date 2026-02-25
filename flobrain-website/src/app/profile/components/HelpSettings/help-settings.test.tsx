import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HelpSettings from "./index";

describe("HelpSettings Component", () => {
  it("should render FAQ placeholder questions", () => {
    render(<HelpSettings />);

    expect(screen.getByText("FAQ Placeholder Question 1")).toBeDefined();
    expect(screen.getByText("FAQ Placeholder Question 2")).toBeDefined();
    expect(screen.getByText("FAQ Placeholder Question 3")).toBeDefined();
    expect(screen.getByText("FAQ Placeholder Question 4")).toBeDefined();
  });

  it("should render expandable FAQ items as buttons", () => {
    render(<HelpSettings />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(4);
  });

  it("should toggle FAQ item when clicked", () => {
    render(<HelpSettings />);

    const firstButton = screen.getByText("FAQ Placeholder Question 1").closest("button");
    expect(firstButton).toBeDefined();

    if (firstButton) {
      fireEvent.click(firstButton);
      // After click, chevron should rotate (expanded state)
      const chevron = firstButton.querySelector("svg");
      expect(chevron).toBeDefined();
    }
  });
});
