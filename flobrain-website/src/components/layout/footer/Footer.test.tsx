import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Footer from ".";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Footer Component", () => {
  it("should render the brand name", () => {
    render(<Footer />);
    expect(screen.getByText("FloLabs Innovations Group")).toBeInTheDocument();
  });

  it("should render footer navigation sections", () => {
    render(<Footer />);
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Follow Us")).toBeInTheDocument();
  });

  it("should render within a semantic footer tag", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
