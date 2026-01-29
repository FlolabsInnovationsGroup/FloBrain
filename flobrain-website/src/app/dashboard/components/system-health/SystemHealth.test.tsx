import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SystemHealth } from ".";

describe("SystemHealth Component", () => {
  it("should render the System Health title", () => {
    render(<SystemHealth />);
    expect(screen.getByText("System Health")).toBeDefined();
  });

  it("should render Brain Status section", () => {
    render(<SystemHealth />);
    expect(screen.getByText("Brain Status")).toBeDefined();
    expect(screen.getByText("Online")).toBeDefined();
  });

  it("should render Connected Devices section", () => {
    render(<SystemHealth />);
    expect(screen.getByText("Connected Devices")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
  });

  it("should render Total tokens section with count and percentage", () => {
    render(<SystemHealth />);
    expect(screen.getByText("Total tokens today")).toBeDefined();
    expect(screen.getByText("2,847,392")).toBeDefined();
    expect(screen.getByText("+18%")).toBeDefined();
  });

  it("should render Brain Status as a link to /brain", () => {
    render(<SystemHealth />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/brain");
  });
});
