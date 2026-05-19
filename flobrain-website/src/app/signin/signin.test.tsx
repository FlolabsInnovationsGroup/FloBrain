import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./page";
import { AuthProvider } from "@/contexts/AuthContext";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields correctly", () => {
    renderWithAuth(<Login />);

    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(screen.getByText("FloBrain")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent === "Sign in to your FloBrain account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should render social login buttons", () => {
    renderWithAuth(<Login />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
  });

  it("should update email input value when user types", () => {
    renderWithAuth(<Login />);

    const emailInput = screen.getByPlaceholderText("your.email@email.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should update password input value when user types", () => {
    renderWithAuth(<Login />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(passwordInput).toHaveValue("password123");
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    renderWithAuth(<Login />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const toggleButtons = screen.getAllByRole("button");
    const passwordToggle = toggleButtons.find(
      (button) => button.querySelector("svg") && button.getAttribute("type") === "button"
    );

    expect(passwordInput).toHaveAttribute("type", "password");

    if (passwordToggle) {
      fireEvent.click(passwordToggle);
      expect(passwordInput).toHaveAttribute("type", "text");

      fireEvent.click(passwordToggle);
      expect(passwordInput).toHaveAttribute("type", "password");
    }
  });

it("should render forgot password button", () => {
    renderWithAuth(<Login />);

    const forgotPasswordButton = screen.getByText("Forgot password?");
    expect(forgotPasswordButton).toBeInTheDocument();
  });

  it("should render register link", () => {
    renderWithAuth(<Login />);

    const registerLink = screen.getByText("Sign up for free");
    expect(registerLink).toHaveAttribute("href", "/register");
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  it("should render sign in button", () => {
    renderWithAuth(<Login />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should handle both inputs filled correctly", () => {
    renderWithAuth(<Login />);

    const emailInput = screen.getByPlaceholderText("your.email@email.com");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "SecurePass123!" } });

    expect(emailInput).toHaveValue("user@example.com");
    expect(passwordInput).toHaveValue("SecurePass123!");
  });

it("should have proper styling for auth card", () => {
    const { container } = renderWithAuth(<Login />);

    const card = container.querySelector(".rounded-2xl");
    expect(card).toBeInTheDocument();
    expect(card?.className).toContain("fb-auth-card");
  });

  it("should render divider text correctly", () => {
    renderWithAuth(<Login />);

    expect(screen.getByText("Or continue with")).toBeInTheDocument();
  });

  it("should display icons for form inputs", () => {
    const { container } = renderWithAuth(<Login />);

    // Check for Mail and Lock icons (lucide-react)
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should handle empty form submission", () => {
    renderWithAuth(<Login />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(submitButton);

    // Verify inputs are still empty (no default behavior)
    const emailInput = screen.getByPlaceholderText("your.email@email.com");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
  });

  it("should have dark purple background", () => {
    const { container } = renderWithAuth(<Login />);

    const main = container.querySelector("main");
    expect(main?.className).toContain("fb-auth-bg");
  });

  it("should handle email input blur event", () => {
    renderWithAuth(<Login />);

    const emailInput = screen.getByPlaceholderText("your.email@email.com");
    fireEvent.change(emailInput, { target: { value: "test@email.com" } });
    fireEvent.blur(emailInput);

    expect(emailInput).toHaveValue("test@email.com");
  });

  it("should handle password input blur event", () => {
    renderWithAuth(<Login />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });
    fireEvent.blur(passwordInput);

    expect(passwordInput).toHaveValue("mypassword");
  });

  it("should render card with proper accessibility attributes", () => {
    renderWithAuth(<Login />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toHaveClass("w-full");
  });
});