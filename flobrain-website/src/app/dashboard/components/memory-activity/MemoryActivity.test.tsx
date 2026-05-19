import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryActivity } from ".";
import { renderWithProviders } from "@/test/render";

const mockActivity = {
  today_count: 1247,
  week_count: 8942,
  total_count: 127_400,
  week_percentage: "+2.3%",
  week_positive: true,
  heatmap: Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0.5)),
};

vi.mock("@/lib/api", () => ({
  api: {
    getDashboardMemoryActivity: vi.fn(() =>
      Promise.resolve({
        data: mockActivity,
        error: undefined,
        status: 200,
      })
    ),
  },
}));

describe("MemoryActivity Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the Memory Activity title", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("MEMORY ACTIVITY")).toBeInTheDocument();
    });
  });

  it("should render the subtitle", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    });
  });

  it("should render TODAY stat card", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("TODAY")).toBeInTheDocument();
      expect(screen.getByText("1.2K")).toBeInTheDocument();
      expect(screen.getByText("chunks created")).toBeInTheDocument();
    });
  });

  it("should render THIS WEEK stat card", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("THIS WEEK")).toBeInTheDocument();
      expect(screen.getByText("8.9K")).toBeInTheDocument();
      expect(screen.getByText("+2.3%")).toBeInTheDocument();
    });
  });

  it("should render TOTAL stat card", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("TOTAL")).toBeInTheDocument();
      expect(screen.getByText("127.4K")).toBeInTheDocument();
      expect(screen.getByText("all time")).toBeInTheDocument();
    });
  });

  it("should render Usage Heatmap title", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("Usage Heatmap")).toBeInTheDocument();
    });
  });

  it("should render all 7 days of the week", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getAllByText("Mon").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Sun").length).toBeGreaterThan(0);
    });
  });

  it("should render time labels", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("12 am")).toBeInTheDocument();
      expect(screen.getByText("12 pm")).toBeInTheDocument();
    });
  });

  it("should render intensity legend", async () => {
    renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("Less")).toBeInTheDocument();
      expect(screen.getByText("More")).toBeInTheDocument();
    });
  });

  it("should render heatmap with circular indicators", async () => {
    const { container } = renderWithProviders(<MemoryActivity />);
    await waitFor(() => {
      expect(screen.getByText("Usage Heatmap")).toBeInTheDocument();
    });
    const cells = container.querySelectorAll(".rounded-full, [style*='borderRadius']");
    expect(cells.length).toBeGreaterThan(0);
  });
});
