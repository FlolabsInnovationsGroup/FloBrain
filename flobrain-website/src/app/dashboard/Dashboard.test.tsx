<<<<<<< HEAD
import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
=======
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
>>>>>>> origin/main
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

vi.mock("next/image", () => ({
  default: (props: { alt?: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt ?? ""} className={props.className} />
  ),
}));

vi.mock("@/assets/images/flolabs-logo.svg", () => ({
  default: "flolabs-logo.svg",
}));

vi.mock("./components/system-health", () => ({
  SystemHealth: () => <div>System Health</div>,
}));

vi.mock("./components/token-usage", () => ({
  TokenUsage: () => <div>Token Usage</div>,
}));

vi.mock("./components/memory-activity", () => ({
  MemoryActivity: () => <div>Memory Activity</div>,
}));

vi.mock("./components/workflow-engine", () => ({
  WorkflowEngine: () => <div>Workflow Engine</div>,
}));

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the dashboard page", () => {
<<<<<<< HEAD
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
=======
    renderDashboard();
    expect(document.querySelector("main")).toBeInTheDocument();
  });

  it("should render the page title and description", () => {
    renderDashboard();
    expect(screen.getByText("SYSTEM DASHBOARD")).toBeInTheDocument();
    expect(
      screen.getByText("Monitor your system health, workflows, and AI model performance")
    ).toBeInTheDocument();
  });

  it("should render SystemHealth component", () => {
    renderDashboard();
    expect(screen.getByText("System Health")).toBeInTheDocument();
  });

  it("should render MemoryActivity component", () => {
    renderDashboard();
    expect(screen.getByText("Memory Activity")).toBeInTheDocument();
  });

  it("should render WorkflowEngine component", () => {
    renderDashboard();
    expect(screen.getByText("Workflow Engine")).toBeInTheDocument();
>>>>>>> origin/main
  });
});
