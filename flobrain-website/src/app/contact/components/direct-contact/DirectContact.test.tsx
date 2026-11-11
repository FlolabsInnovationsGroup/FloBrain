import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DirectContact } from ".";

describe("DirectContact Component", () => {
  it("should render the Direct Contact heading", () => {
    render(<DirectContact />);
    expect(screen.getByText("Direct Contact")).toBeDefined();
  });

  it("should render Technical Support card", () => {
    render(<DirectContact />);
    expect(screen.getByText("Technical Support")).toBeDefined();
    expect(screen.getByText("For developers integrating the SDK")).toBeDefined();
    expect(screen.getByText("support@flolabs.ai")).toBeDefined();
  });

  it("should render Partnerships card", () => {
    render(<DirectContact />);
    expect(screen.getByText("Partnerships")).toBeDefined();
    expect(screen.getByText("For device manufacturers")).toBeDefined();
    expect(screen.getByText("partners@flolabs.ai")).toBeDefined();
  });

  it("should render Press / Media card", () => {
    render(<DirectContact />);
    expect(screen.getByText("Press / Media")).toBeDefined();
    expect(screen.getByText("Media inquiries and press kit")).toBeDefined();
    expect(screen.getByText("press@flolabs.ai")).toBeDefined();
  });

  it("should render support email as a mailto link", () => {
    render(<DirectContact />);
    const link = screen.getByText("support@flolabs.ai").closest("a");
    expect(link?.getAttribute("href")).toBe("mailto:support@flolabs.ai");
  });

  it("should render partners email as a mailto link", () => {
    render(<DirectContact />);
    const link = screen.getByText("partners@flolabs.ai").closest("a");
    expect(link?.getAttribute("href")).toBe("mailto:partners@flolabs.ai");
  });

  it("should render press email as a mailto link", () => {
    render(<DirectContact />);
    const link = screen.getByText("press@flolabs.ai").closest("a");
    expect(link?.getAttribute("href")).toBe("mailto:press@flolabs.ai");
  });
});
