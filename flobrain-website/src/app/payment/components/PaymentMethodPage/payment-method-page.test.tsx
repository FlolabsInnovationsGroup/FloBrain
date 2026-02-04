// At the top of the file
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PaymentMethodPage from "./index";
import React from "react";

// Define mocks in vi.hoisted
const { mockStripePromise, mockStripe, mockElements } = vi.hoisted(() => {
  const mockStripeInstance = {
    createPaymentMethod: vi.fn(),
  };
  return {
    mockStripePromise: Promise.resolve(mockStripeInstance),
    mockStripe: mockStripeInstance,
    mockElements: {
      getElement: vi.fn(),
    },
  };
});

// Mock Stripe
vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() => mockStripePromise),
}));

// Mock react-stripe-js
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
  CardNumberElement: () => <input data-testid="card-number" />,
  CardExpiryElement: () => <input data-testid="card-expiry" />,
  CardCvcElement: () => <input data-testid="card-cvc" />,
  useStripe: () => mockStripe,
  useElements: () => mockElements,
}));

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
  CreditCard: () => <div data-testid="credit-card-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Check: () => <div data-testid="check-icon" />,
}));



describe("PaymentMethodPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockElements.getElement.mockReturnValue({});
    mockStripe.createPaymentMethod.mockReset();
  });

  it("should render payment method page", () => {
    render(<PaymentMethodPage />);

    expect(screen.getByText("Add payment method")).toBeInTheDocument();
    expect(screen.getByText("Card Details")).toBeInTheDocument();
  });

  it("should render all Stripe card input elements", () => {
    render(<PaymentMethodPage />);

    expect(screen.getByTestId("card-number")).toBeInTheDocument();
    expect(screen.getByTestId("card-expiry")).toBeInTheDocument();
    expect(screen.getByTestId("card-cvc")).toBeInTheDocument();
  });

  it("should render accepted card types", () => {
    render(<PaymentMethodPage />);

    expect(screen.getByText("We accept:")).toBeInTheDocument();
    expect(screen.getByText("Visa")).toBeInTheDocument();
    expect(screen.getByText("Mastercard")).toBeInTheDocument();
  });

  

  it("should show processing state when submitting payment", async () => {
    mockElements.getElement.mockReturnValue({});
    mockStripe.createPaymentMethod.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ paymentMethod: { id: "pm_123" } }), 100)
      )
    );

    render(<PaymentMethodPage />);

    const submitButton = screen.getByRole("button", { 
      name: /complete payment/i 
    });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });
  });

  it("should handle successful payment", async () => {
    mockElements.getElement.mockReturnValue({});
    mockStripe.createPaymentMethod.mockResolvedValue({
      paymentMethod: { id: "pm_test_123" },
    });

    render(<PaymentMethodPage />);

    const submitButton = screen.getByRole("button", { 
      name: /complete payment/i 
    });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 2500 }
    );
  });

  it("should display error message on payment failure", async () => {
    mockElements.getElement.mockReturnValue({});
    mockStripe.createPaymentMethod.mockResolvedValue({
      error: { message: "Your card was declined" },
    });

    render(<PaymentMethodPage />);

    const submitButton = screen.getByRole("button", { 
      name: /complete payment/i 
    });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Your card was declined")).toBeInTheDocument();
    });
  });

  it("should handle card element not found error", async () => {
    mockElements.getElement.mockReturnValue(null);

    render(<PaymentMethodPage />);

    const submitButton = screen.getByRole("button", { 
      name: /complete payment/i 
    });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Card element not found")).toBeInTheDocument();
    });
  });

  it("should navigate back when back button is clicked", async () => {
    render(<PaymentMethodPage />);

    const backButton = screen.getByRole("button", { name: /back/i });
    await fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("should display security information", () => {
    render(<PaymentMethodPage />);

    expect(screen.getByText("SSL Encrypted")).toBeInTheDocument();
    expect(screen.getByText("PCI Compliant")).toBeInTheDocument();
  });
});
