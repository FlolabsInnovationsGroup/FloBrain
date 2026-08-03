import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BrainPage from "./page";


vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/app/home/components/left-panel", () => ({
  LeftPanel: () => <div data-testid="left-panel">LeftPanel</div>,
}));

vi.mock("./components/ChatArea/index", () => ({
  default: () => <div data-testid="chat-area">ChatArea</div>,
}));

vi.mock("./components/MessageInput/index", () => ({
  default: () => <div data-testid="message-input">MessageInput</div>,
}));

vi.mock("jspdf", () => ({ __esModule: true, default: vi.fn() }));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("BrainPage", () => {
  it("renders welcome content and left panel", () => {
    render(<BrainPage />);
    expect(screen.getByTestId("left-panel")).toBeInTheDocument();
    expect(screen.getByText("Welcome to FLOBRAIN")).toBeInTheDocument();
    expect(screen.getByText(/Start a new conversation/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start New Chat/i })).toBeInTheDocument();
  });

  it("starts new chat when Start New Chat is clicked", () => {
    render(<BrainPage />);
    fireEvent.click(screen.getByRole("button", { name: /Start New Chat/i }));
    expect(screen.getByTestId("chat-area")).toBeInTheDocument();
    expect(screen.getByTestId("message-input")).toBeInTheDocument();
  });
});
