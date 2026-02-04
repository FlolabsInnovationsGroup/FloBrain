import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PlanUpgradePopup from "./index";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
}));

describe("PlanUpgradePopup Component", () => {
  const mockCurrentPlan = {
    name: "Developer",
    price: "Free",
  };

  const mockSelectedPlan = {
    name: "Pro",
    price: "$49",
    period: "/month",
  };

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(
      <PlanUpgradePopup
        isOpen={false}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText("Confirm changes")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Confirm changes")).toBeInTheDocument();
  });

  it("should display current and selected plans", () => {
    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getAllByText("$49").length).toBeGreaterThan(0);

  });

  it("should show upgrade arrow when upgrading", () => {
    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("↓ Upgrade to")).toBeInTheDocument();
  });

  it("should close popup when close button is clicked", async () => {
    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    const closeButton = screen.getByTestId("x-icon").parentElement;
    if (closeButton) {
      await fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should close popup when backdrop is clicked", async () => {
    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    const backdrop = screen.getByText("Confirm changes").parentElement?.parentElement?.previousSibling;
    
    if (backdrop) {
      await fireEvent.click(backdrop as Element);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("should close popup when Cancel button is clicked", async () => {
    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    await fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm for free plan and close popup", async () => {
    const freePlan = { name: "Developer", price: "Free", period: "" };

    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={freePlan}
        onConfirm={mockOnConfirm}
      />
    );

    const activateButton = screen.getByText("Activate");
    await fireEvent.click(activateButton);

    expect(mockOnConfirm).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should navigate to checkout for paid plans", async () => {
    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    const continueButton = screen.getByText("Continue");
    await fireEvent.click(continueButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/checkout?plan=Pro&price=")
    );
  });

  it("should navigate to contact sales for custom/enterprise plans", async () => {
    const enterprisePlan = { name: "Enterprise", price: "Custom", period: "" };

    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={enterprisePlan}
        onConfirm={mockOnConfirm}
      />
    );

    const contactSalesButton = screen.getByText("Contact Sales");
    await fireEvent.click(contactSalesButton);

    expect(mockPush).toHaveBeenCalledWith("/contact-sales");
  });

  it("should display payment method message for paid plans", () => {
    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={mockSelectedPlan}
        onConfirm={mockOnConfirm}
      />
    );

    expect(
      screen.getByText(/You will be redirected to complete your billing information and payment/i)
    ).toBeInTheDocument();
  });

  it("should display enterprise contact message for custom plans", () => {
    const enterprisePlan = { name: "Enterprise", price: "Custom", period: "" };

    render(
      <PlanUpgradePopup
        isOpen={true}
        onClose={mockOnClose}
        currentPlan={mockCurrentPlan}
        selectedPlan={enterprisePlan}
        onConfirm={mockOnConfirm}
      />
    );

    expect(
      screen.getByText(/Our sales team will contact you to discuss custom pricing/i)
    ).toBeInTheDocument();
  });
});
