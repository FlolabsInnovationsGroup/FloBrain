import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Pricing from "./page";
import { renderWithProviders } from "@/test/render";

vi.mock("./components/popup", () => ({
  default: () => null,
}));

vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
  Brain: () => <div data-testid="brain-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Building2: () => <div data-testid="building2-icon" />,
  Crown: () => <div data-testid="crown-icon" />,
}));

describe("Pricing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render pricing headline", () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText(/Pricing Built for/i)).toBeInTheDocument();
    expect(screen.getByText(/Every Stage of Growth/i)).toBeInTheDocument();
  });

  it("should render all plan tiers", () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });
});
