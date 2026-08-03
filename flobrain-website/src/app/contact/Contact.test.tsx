import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Contact from "./page";

describe("Contact Page", () => {
  it("should render the page without crashing", () => {
    const { container } = render(<Contact />);
    expect(container).toBeDefined();
  });

  it("should render the hero heading", () => {
    render(<Contact />);
    expect(screen.getByText("Scale Your AI Intelligence")).toBeDefined();
  });

  it("should render the contact form", () => {
    render(<Contact />);
    expect(screen.getByText("Get in Touch")).toBeDefined();
  });

  it("should render the direct contact section", () => {
    render(<Contact />);
    expect(screen.getByText("Direct Contact")).toBeDefined();
  });

  it("should render the developer resources section", () => {
    render(<Contact />);
    expect(screen.getByText("Developer Resources")).toBeDefined();
  });
});
