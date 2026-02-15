import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HelpSettings from "./index";

describe("HelpSettings Component", () => {
  it("should render Help heading", () => {
    render(<HelpSettings />);

    const heading = screen.getByRole("heading", { name: /help/i });
    expect(heading).toBeDefined();
  });

  it("should render all help topics", () => {
    render(<HelpSettings />);

    expect(screen.getByRole("button", { name: /getting started/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /account management/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /privacy & security/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /contact support/i })).toBeDefined();
  });

  it("should show topic descriptions", () => {
    render(<HelpSettings />);

    expect(
      screen.getByText(/learn the basics of using the platform/i)
    ).toBeDefined();
    expect(
      screen.getByText(/manage your account settings and preferences/i)
    ).toBeDefined();
    expect(
      screen.getByText(/understand how we protect your data/i)
    ).toBeDefined();
    expect(
      screen.getByText(/get in touch with our support team/i)
    ).toBeDefined();
  });

  it("should render topics as accessible buttons", () => {
    render(<HelpSettings />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });
});

