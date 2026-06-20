import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TokenUsage } from "./index";
import { renderWithProviders } from "@/test/render";

vi.mock("@/hooks/useTokenUsage", () => ({
  useTokenUsage: vi.fn(),
}));

import { useTokenUsage } from "@/hooks/useTokenUsage";

const mockUseTokenUsage = vi.mocked(useTokenUsage);

describe("TokenUsage Component", () => {
  beforeEach(() => {
    mockUseTokenUsage.mockReturnValue({
      summary: {
        total_tokens: 2847392,
        change_percent: 18,
        period_start: "2026-06-13",
        period_end: "2026-06-20",
        breakdown_by_model: [],
      },
      daily: [
        { date: "2026-06-14", total_tokens: 100, request_count: 1 },
        { date: "2026-06-15", total_tokens: 200, request_count: 2 },
        { date: "2026-06-16", total_tokens: 150, request_count: 1 },
        { date: "2026-06-17", total_tokens: 300, request_count: 3 },
        { date: "2026-06-18", total_tokens: 250, request_count: 2 },
        { date: "2026-06-19", total_tokens: 400, request_count: 4 },
        { date: "2026-06-20", total_tokens: 500, request_count: 5 },
      ],
      quota: {
        plan: "personal",
        limit_tokens: 100000,
        limit_requests: 100,
        used_tokens: 5000,
        used_requests: 10,
        remaining_tokens: 95000,
        remaining_requests: 90,
        reset_at: "2026-07-01T00:00:00Z",
      },
      isLoading: false,
      error: null,
    });
  });

  it("should render the token usage component", () => {
    const { container } = renderWithProviders(<TokenUsage />);
    expect(container).toBeDefined();
  });

  it("should display the TOKEN USAGE title", () => {
    renderWithProviders(<TokenUsage />);
    expect(screen.getByText("TOKEN USAGE")).toBeDefined();
  });

  it("should display the subtitle 'Last 7 days'", () => {
    renderWithProviders(<TokenUsage />);
    expect(screen.getByText("Last 7 days")).toBeDefined();
  });

  it("should display the token count from API", async () => {
    renderWithProviders(<TokenUsage />);
    await waitFor(() => {
      expect(screen.getByText("2,847,392")).toBeDefined();
    });
  });

  it("should display the percentage change", () => {
    renderWithProviders(<TokenUsage />);
    expect(screen.getByText("+18%")).toBeDefined();
  });

  it("should display the comparison text", () => {
    renderWithProviders(<TokenUsage />);
    expect(screen.getByText("vs. last week")).toBeDefined();
  });

  it("should render the sparkline chart", () => {
    const { container } = renderWithProviders(<TokenUsage />);
    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeDefined();
  });

  it("should render the chart path", () => {
    const { container } = renderWithProviders(<TokenUsage />);
    const pathElement = container.querySelector("path");
    expect(pathElement).toBeDefined();
  });

  it("should show error state when API fails", () => {
    mockUseTokenUsage.mockReturnValue({
      summary: undefined,
      daily: undefined,
      quota: undefined,
      isLoading: false,
      error: new Error("Failed"),
    });
    renderWithProviders(<TokenUsage />);
    expect(screen.getByText(/Failed to load token usage/)).toBeDefined();
  });
});
