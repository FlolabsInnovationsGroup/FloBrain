import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContactHero } from ".";

describe("ContactHero Component", () => {
  it("should render the main heading", () => {
    render(<ContactHero />);
    expect(screen.getByText("Scale Your AI Intelligence")).toBeDefined();
  });

  it("should render the subtitle paragraph", () => {
    render(<ContactHero />);
    expect(screen.getByText(/Connect with our engineering team/i)).toBeDefined();
  });

  it("should render inside a section element", () => {
    const { container } = render(<ContactHero />);
    expect(container.querySelector("section")).toBeDefined();
  });
});
