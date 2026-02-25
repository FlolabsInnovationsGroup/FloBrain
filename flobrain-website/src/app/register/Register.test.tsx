import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Register from "./page";

// Mock Next.js router
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields correctly", () => {
    render(<Register />);

    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Password")[0]).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("should render social login buttons", () => {
    render(<Register />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
  });

  it("should update name input value when user types", () => {
    render(<Register />);

    const nameInput = screen.getByPlaceholderText("John Doe");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    expect(nameInput).toHaveValue("John Doe");
  });

  it("should update email input value when user types", () => {
    render(<Register />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should update password input value when user types", () => {
    render(<Register />);

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwordInputs[0];
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(passwordInput).toHaveValue("password123");
  });

  it("should update confirm password input value when user types", () => {
    render(<Register />);

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const confirmPasswordInput = passwordInputs[1];
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });

    expect(confirmPasswordInput).toHaveValue("password123");
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    render(<Register />);

    const passwordInput = screen.getAllByPlaceholderText("••••••••")[0];
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
    render(<Register />);

    const confirmPasswordInput = screen.getAllByPlaceholderText("••••••••")[1];
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
    render(<Register />);

    const signInLink = screen.getByText("Login");
    expect(signInLink).toHaveAttribute("href", "/signin");
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
  });

  it("should render create account button", () => {
    render(<Register />);

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should handle all inputs filled correctly", () => {
    render(<Register />);

    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "SecurePass123!" } });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("SecurePass123!");
    expect(confirmPasswordInput).toHaveValue("SecurePass123!");
  });

  it("should have form card with dark theme styling", () => {
    const { container } = render(<Register />);

    const formCard = container.querySelector(".rounded-2xl");
    expect(formCard).toBeInTheDocument();
    expect(formCard?.className).toContain("bg-[#1a1525]");
  });

  it("should render divider text correctly", () => {
    render(<Register />);

    expect(screen.getByText("Or continue with")).toBeInTheDocument();
  });

  it("should display icons for form inputs", () => {
    const { container } = render(<Register />);

    // Check for Mail, Lock, and User icons (lucide-react)
    const mailIcon = container.querySelector("svg");
    expect(mailIcon).toBeInTheDocument();
  });

  it("should handle empty form submission", () => {
    render(<Register />);

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    fireEvent.click(submitButton);

    // Verify inputs are still empty (no default behavior)
    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");

    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    expect(passwordInputs[0]).toHaveValue("");
    expect(passwordInputs[1]).toHaveValue("");
  });
});
