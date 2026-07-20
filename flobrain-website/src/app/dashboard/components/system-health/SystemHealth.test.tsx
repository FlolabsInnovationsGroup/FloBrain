import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SystemHealth } from ".";
import { renderWithProviders } from "@/test/render";

vi.mock("@/lib/api", () => ({
  api: {
    getDashboardHealth: vi.fn(() =>
      Promise.resolve({
        data: {
          backend: "online",
          allSystemsOperational: true,
          database: "connected",
        },
        error: undefined,
        status: 200,
      })
    ),
  },
}));

describe("SystemHealth Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the System Health title", async () => {
    renderWithProviders(<SystemHealth />);
    await waitFor(() => {
      expect(screen.getByText("SYSTEM HEALTH")).toBeInTheDocument();
    });
  });

  it("should render Brain Status section", async () => {
    renderWithProviders(<SystemHealth />);
    await waitFor(() => {
      expect(screen.getByText(/Brain Status: Online/i)).toBeInTheDocument();
    });
  });

  it("should render Database section", async () => {
    renderWithProviders(<SystemHealth />);
    await waitFor(() => {
      expect(screen.getByText("Database")).toBeInTheDocument();
      expect(screen.getByText("connected")).toBeInTheDocument();
    });
  });
});
