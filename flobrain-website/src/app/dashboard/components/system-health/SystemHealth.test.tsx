import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SystemHealth } from ".";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    getDashboardHealth: vi.fn(),
  },
}));

const mockGetDashboardHealth = vi.mocked(api.getDashboardHealth);

function renderSystemHealth() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SystemHealth />
    </QueryClientProvider>
  );
}

describe("SystemHealth Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render SYSTEM HEALTH title and online status on success", async () => {
    mockGetDashboardHealth.mockResolvedValue({
      data: {
        status: "ok",
        backend: "online",
        database: "connected",
        allSystemsOperational: true,
        system_status: "online",
      },
      status: 200,
    });

    renderSystemHealth();

    expect(screen.getByText("SYSTEM HEALTH")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Online")).toBeInTheDocument();
    });
    expect(screen.getByText("All systems operational")).toBeInTheDocument();
  });

  it("should show FloBrain connect message when the request fails without a backend error", async () => {
    mockGetDashboardHealth.mockResolvedValue({
      error: "Couldn't connect to FloBrain",
      details: "Network Error",
      status: 0,
    });

    renderSystemHealth();

    await waitFor(() => {
      expect(screen.getByText("Couldn't connect to FloBrain")).toBeInTheDocument();
    });
    expect(
      screen.queryByText("Unable to reach backend. Check that the API is running.")
    ).not.toBeInTheDocument();
  });

  it("should display a backend-provided error message when present", async () => {
    mockGetDashboardHealth.mockResolvedValue({
      error: "Dashboard service is unavailable",
      status: 503,
    });

    renderSystemHealth();

    await waitFor(() => {
      expect(screen.getByText("Dashboard service is unavailable")).toBeInTheDocument();
    });
    expect(screen.queryByText("Couldn't connect to FloBrain")).not.toBeInTheDocument();
  });
});
