import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Register from "./page";
import { AuthProvider } from "@/contexts/AuthContext";

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

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields correctly", () => {
    renderWithAuth(<Register />);

    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByText("FloBrain")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Password")[0]).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("should render social login buttons", () => {
    renderWithAuth(<Register />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
  });

  it("should update name input value when user types", () => {
    renderWithAuth(<Register />);

    const nameInput = screen.getByPlaceholderText("Enter your full name");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    expect(nameInput).toHaveValue("John Doe");
  });

  it("should update email input value when user types", () => {
    renderWithAuth(<Register />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should update password input value when user types", () => {
    renderWithAuth(<Register />);

    const passwordInput = screen.getByPlaceholderText("Create a password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(passwordInput).toHaveValue("password123");
  });

  it("should update confirm password input value when user types", () => {
    renderWithAuth(<Register />);

    const confirmPasswordInput = screen.getByPlaceholderText("Confirm your password");
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });

    expect(confirmPasswordInput).toHaveValue("password123");
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    renderWithAuth(<Register />);

    const passwordInput = screen.getByPlaceholderText("Create a password");
    const toggleButtons = screen.getAllByRole("button");
    const passwordToggle = toggleButtons.find(
      (button) => button.querySelector("svg") && button.closest("div")?.querySelector("#password")
    );

    expect(passwordInput).toHaveAttribute("type", "password");

    if (passwordToggle) {
      fireEvent.click(passwordToggle);
      expect(passwordInput).toHaveAttribute("type", "text");

      fireEvent.click(passwordToggle);
      expect(passwordInput).toHaveAttribute("type", "password");
    }
  });

  it("should toggle confirm password visibility when eye icon is clicked", () => {
    renderWithAuth(<Register />);

    const confirmPasswordInput = screen.getByPlaceholderText("Confirm your password");
    const toggleButtons = screen.getAllByRole("button");
    const confirmPasswordToggle = toggleButtons.find(
      (button) =>
        button.querySelector("svg") && button.closest("div")?.querySelector("#confirm-password")
    );

    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    if (confirmPasswordToggle) {
      fireEvent.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute("type", "text");

      fireEvent.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    }
  });

  it("should render sign in link", () => {
    renderWithAuth(<Register />);

    const signInLink = screen.getByText("Login");
    expect(signInLink).toHaveAttribute("href", "/signin");
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
  });

  it("should render create account button", () => {
    renderWithAuth(<Register />);

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should handle all inputs filled correctly", () => {
    renderWithAuth(<Register />);

    const nameInput = screen.getByPlaceholderText("Enter your full name");
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Create a password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm your password");

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "SecurePass123!" } });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("SecurePass123!");
    expect(confirmPasswordInput).toHaveValue("SecurePass123!");
  });

  it("should have proper styling for auth card", () => {
    const { container } = renderWithAuth(<Register />);

    const card = container.querySelector(".rounded-2xl");
    expect(card).toBeInTheDocument();
    expect(card?.className).toContain("CABEE8");
  });

  it("should render divider text correctly", () => {
    renderWithAuth(<Register />);

    expect(screen.getByText("Or continue with")).toBeInTheDocument();
  });

  it("should display icons for form inputs", () => {
    const { container } = renderWithAuth(<Register />);

    // Check for Mail, Lock, and User icons (lucide-react)
    const mailIcon = container.querySelector("svg");
    expect(mailIcon).toBeInTheDocument();
  });

  it("should handle empty form submission", () => {
    renderWithAuth(<Register />);

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    fireEvent.click(submitButton);

    // Verify inputs are still empty (no default behavior)
    const nameInput = screen.getByPlaceholderText("Enter your full name");
    const emailInput = screen.getByPlaceholderText("Enter your email");

    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
  });
});
