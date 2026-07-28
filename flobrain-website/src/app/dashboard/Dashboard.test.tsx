import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "./page";

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
  it("should render the dashboard page", () => {
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
  });
});
