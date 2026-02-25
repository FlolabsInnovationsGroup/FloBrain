import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Pricing from "./page";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
  LayoutGrid: () => <div data-testid="layout-grid-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Building2: () => <div data-testid="building2-icon" />,
  Building: () => <div data-testid="building-icon" />,
}));

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: {
    name: string;
    price?: string;
    features?: string[];
  };
  selectedPlan: {
    name: string;
    price?: string;
    features?: string[];
  };
}

vi.mock("./components/popup", () => ({
  default: ({ isOpen, onClose, currentPlan, selectedPlan }: PopupProps) => {
    if (!isOpen) return null;

    return (
      <div
        data-testid="plan-upgrade-popup"
        style={{ position: "fixed", zIndex: 9999, background: "rgba(0,0,0,0.5)" }}
      >
        <div style={{ background: "black", padding: "20px", color: "white" }}>
          <div>Current: {currentPlan.name}</div>
          <div>Selected: {selectedPlan.name}</div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  },
}));

describe("Pricing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should open popup when Pro plan button is clicked", async () => {
    render(<Pricing />);

    const proButtons = screen.getAllByRole("button", {
      name: /start free trial/i,
    });
    const proButton = proButtons[0];

    await fireEvent.click(proButton);

    await waitFor(
      () => {
        expect(screen.getByTestId("plan-upgrade-popup")).toBeInTheDocument();
        expect(screen.getByText("Current: Developer")).toBeInTheDocument();
        expect(screen.getByText("Selected: Pro")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should close popup when close is triggered", async () => {
    render(<Pricing />);

    const proButtons = screen.getAllByRole("button", {
      name: /start free trial/i,
    });
    const proButton = proButtons[0];

    await fireEvent.click(proButton);

    await waitFor(() => {
      expect(screen.getByTestId("plan-upgrade-popup")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("Close");
    await fireEvent.click(closeButton);

    await waitFor(
      () => {
        expect(screen.queryByTestId("plan-upgrade-popup")).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  //   // Additional test: Verify Enterprise "Contact Sales" navigation
  //   it("should handle Enterprise Contact Sales button", async () => {
  //     const mockPush = vi.fn();
  //     vi.mocked(require("next/navigation").useRouter).mockReturnValue({
  //       push: mockPush,
  //     });

  //     render(<Pricing />);

  //     const contactSalesButton = screen.getByRole("button", {
  //       name: /contact sales/i
  //     });

  //     await fireEvent.click(contactSalesButton);

  //     expect(mockPush).toHaveBeenCalledWith("/contact-sales");
  //   });
});
