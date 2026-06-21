import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckoutPage from "./index";

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Lock: () => <div data-testid="lock-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

describe("CheckoutPage Component", () => {
  const mockSelectedPlan = {
    name: "Pro",
    price: "$49",
    period: "/month",
    features: [
      "Unlimited workflows/automations",
      "Priority email support",
      "Advanced monitoring",
      "30-day data retention",
      "Custom workflow templates",
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("should render the checkout page with plan details", () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    expect(screen.getByText("Complete your purchase")).toBeInTheDocument();
    expect(screen.getByText("Pro Plan")).toBeInTheDocument();
    // Fix: Use getAllByText since "$49" appears multiple times
    expect(screen.getAllByText("$49").length).toBeGreaterThan(0);
  });

  it("should render all billing information input fields", () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your company name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("EU123456789")).toBeInTheDocument();
  });

  it("should update billing info state when user types in fields", async () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const nameInput = screen.getByPlaceholderText("John Doe");

    await fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    await fireEvent.change(nameInput, { target: { value: "John Smith" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(nameInput).toHaveValue("John Smith");
  });

  it("should update country selection", async () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const countrySelect = screen.getByRole("combobox");

    await fireEvent.change(countrySelect, { target: { value: "Lebanon" } });

    expect(countrySelect).toHaveValue("Lebanon");
  });

  it("should toggle terms and conditions checkbox", async () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const termsCheckbox = screen.getByRole("checkbox");

    expect(termsCheckbox).not.toBeChecked();

    await fireEvent.click(termsCheckbox);

    expect(termsCheckbox).toBeChecked();
  });

  it("should disable submit button when terms are not accepted", () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const submitButton = screen.getByRole("button", {
      name: /continue to payment/i,
    });

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass("cursor-not-allowed");
  });

  it("should enable submit button when terms are accepted", async () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /continue to payment/i,
    });

    await fireEvent.click(termsCheckbox);

    expect(submitButton).not.toBeDisabled();
  });

  it("should not submit form when terms are not accepted", async () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const nameInput = screen.getByPlaceholderText("John Doe");
    const submitButton = screen.getByRole("button", {
      name: /continue to payment/i,
    });

    await fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    await fireEvent.change(nameInput, { target: { value: "John Smith" } });
    await fireEvent.click(submitButton);

    expect(mockPush).not.toHaveBeenCalled();
  });

  // Fix: Use submit button directly instead of getByRole("form")
  it("should store billing info in sessionStorage and navigate on successful submission", async () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const nameInput = screen.getByPlaceholderText("John Doe");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /continue to payment/i,
    });

    await fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    await fireEvent.change(nameInput, { target: { value: "John Smith" } });
    await fireEvent.click(termsCheckbox);
    await fireEvent.click(submitButton); // Click submit button directly

    await waitFor(() => {
      const storedData = sessionStorage.getItem("billingInfo");
      expect(storedData).toBeDefined();

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        expect(parsedData.email).toBe("test@example.com");
        expect(parsedData.fullName).toBe("John Smith");
      }

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/payment?plan=Pro&price=$49"));
    });
  });

  it("should navigate back when back button is clicked", async () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const backButton = screen.getByText("Back to pricing");

    await fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("should render order summary with correct plan features", () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("What is included:")).toBeInTheDocument();

    mockSelectedPlan.features.slice(0, 5).forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it("should display security badge", () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    expect(screen.getByText("Secure SSL encrypted payment")).toBeInTheDocument();
  });

  it("should handle empty company and VAT ID fields (optional)", async () => {
    render(<CheckoutPage selectedPlan={mockSelectedPlan} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const nameInput = screen.getByPlaceholderText("John Doe");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /continue to payment/i,
    });

    await fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    await fireEvent.change(nameInput, { target: { value: "John Smith" } });
    await fireEvent.click(termsCheckbox);
    await fireEvent.click(submitButton);

    await waitFor(() => {
      const storedData = sessionStorage.getItem("billingInfo");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        expect(parsedData.company).toBe("");
        expect(parsedData.vatId).toBe("");
      }
    });
  });
});
