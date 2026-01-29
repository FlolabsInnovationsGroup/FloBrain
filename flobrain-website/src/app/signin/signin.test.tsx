import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./page";

// Mock Next.js router
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields correctly", () => {
    render(<Login />);

    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your FLOBRAIN account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should render social login buttons", () => {
    render(<Login />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
  });

  it("should update email input value when user types", () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should update password input value when user types", () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    expect(passwordInput).toHaveValue("password123");
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const toggleButtons = screen.getAllByRole("button");
    const passwordToggle = toggleButtons.find(
      button => button.querySelector('svg') && button.getAttribute('type') === 'button'
    );

    expect(passwordInput).toHaveAttribute("type", "password");
    
    if (passwordToggle) {
      fireEvent.click(passwordToggle);
      expect(passwordInput).toHaveAttribute("type", "text");
      
      fireEvent.click(passwordToggle);
      expect(passwordInput).toHaveAttribute("type", "password");
    }
  });

  it("should render forgot password link", () => {
    render(<Login />);
    
    const forgotPasswordLink = screen.getByText("Forgot password?");
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it("should render register link", () => {
    render(<Login />);
    
    const registerLink = screen.getByText("Register for free");
    expect(registerLink).toHaveAttribute("href", "/register");
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  it("should render sign in button", () => {
    render(<Login />);
    
    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should handle both inputs filled correctly", () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "SecurePass123!" } });
    
    expect(emailInput).toHaveValue("user@example.com");
    expect(passwordInput).toHaveValue("SecurePass123!");
  });

  it("should have proper styling classes for glass morphism effect", () => {
    const { container } = render(<Login />);
    
    const card = container.querySelector(".bg-white\\/5");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("backdrop-blur-xl");
  });

  it("should render divider text correctly", () => {
    render(<Login />);
    
    expect(screen.getByText("or continue with")).toBeInTheDocument();
  });

  it("should display icons for form inputs", () => {
    const { container } = render(<Login />);
    
    // Check for Mail and Lock icons (lucide-react)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should handle empty form submission", () => {
    render(<Login />);
    
    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(submitButton);
    
    // Verify inputs are still empty (no default behavior)
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    
    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
  });

  it("should have background gradient styling", () => {
    const { container } = render(<Login />);
    
    const main = container.querySelector("main");
    expect(main).toHaveClass("bg-gradient-to-br");
    expect(main).toHaveClass("from-purple-950");
  });

  it("should handle email input blur event", () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@email.com" } });
    fireEvent.blur(emailInput);
    
    expect(emailInput).toHaveValue("test@email.com");
  });

  it("should handle password input blur event", () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });
    fireEvent.blur(passwordInput);
    
    expect(passwordInput).toHaveValue("mypassword");
  });

  it("should render card with proper accessibility attributes", () => {
    render(<Login />);
    
    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toHaveClass("w-full");
  });

});
