import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomePage from ".";

describe("HomePage Integration", () => {
  it("renders primary hero and CTA sections", () => {
    render(<HomePage />);
    expect(
      screen.getByText("Build intelligent product experiences with one AI operating layer.")
    ).toBeDefined();
    expect(screen.getByRole("link", { name: /Start free/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /Book demo/i })).toHaveAttribute("href", "/contact");
  });

  it("renders key feature and solution cards", () => {
    render(<HomePage />);
    expect(screen.getByText("Agentic Workflows")).toBeDefined();
    expect(screen.getByText("Multi-Model Router")).toBeDefined();
    expect(screen.getByText("Care & Health")).toBeDefined();
    expect(screen.getByText("Enterprise Ops")).toBeDefined();
  });

  it("renders implementation steps and bottom CTA", () => {
    render(<HomePage />);
    expect(screen.getByText("How teams launch with Caipo")).toBeDefined();
    expect(screen.getByText("Step 1")).toBeDefined();
    expect(screen.getByText("Ready to build your CAIPO experience?")).toBeDefined();
    expect(screen.getByRole("link", { name: /Create account/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /View pricing/i })).toHaveAttribute("href", "/pricing");
  });
});
