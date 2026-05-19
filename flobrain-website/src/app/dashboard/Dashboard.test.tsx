import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "./page";
import { renderWithProviders } from "@/test/render";

vi.mock("@/lib/api", () => ({
  api: {
    getDashboardHealth: vi.fn(() =>
      Promise.resolve({
        data: { backend: "online", allSystemsOperational: true, database: "connected" },
        status: 200,
      })
    ),
    getDashboardTokens: vi.fn(() =>
      Promise.resolve({ data: { total: 1000, change: 10 }, status: 200 })
    ),
    getDashboardMemory: vi.fn(() =>
      Promise.resolve({ data: { chunks: 100, change: 5 }, status: 200 })
    ),
    getDashboardWorkflows: vi.fn(() =>
      Promise.resolve({ data: { errors: [] }, status: 200 })
    ),
  },
}));

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the dashboard page", () => {
    renderWithProviders(<Dashboard />);
    expect(document.querySelector("main")).toBeDefined();
  });

  it("should render the page title", async () => {
    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("SYSTEM DASHBOARD")).toBeInTheDocument();
    });
  });

  it("should render SystemHealth component after loading", async () => {
    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("SYSTEM HEALTH")).toBeInTheDocument();
    });
  });
});
