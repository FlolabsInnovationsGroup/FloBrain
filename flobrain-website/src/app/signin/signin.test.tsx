import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignInCard } from "./signin-card";
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

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields correctly", () => {
    renderWithAuth(<SignInCard />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("johndoe@gmail.com")).toBeInTheDocument();
  });

  it("should render social login buttons", () => {
    renderWithAuth(<SignInCard />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
  });

  it("should update email input value when user types", () => {
    renderWithAuth(<SignInCard />);

    const emailInput = screen.getByPlaceholderText("johndoe@gmail.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should update password input value when user types", () => {
    renderWithAuth(<SignInCard />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(passwordInput).toHaveValue("password123");
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    renderWithAuth(<SignInCard />);

<<<<<<< HEAD
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const toggleButtons = screen.getAllByRole("button");
    const passwordToggle = toggleButtons.find(
      (button) => button.querySelector("svg") && button.getAttribute("type") === "button"
    );
=======
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const toggleButton = screen.getByRole("button", { name: /show password/i });
>>>>>>> origin/main

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should render forgot password button", () => {
    renderWithAuth(<SignInCard />);

    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("should render register link", () => {
    renderWithAuth(<SignInCard />);

    const registerLink = screen.getByText("Sign up");
    expect(registerLink).toHaveAttribute("href", "/register");
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  it("should render sign in button", () => {
    renderWithAuth(<SignInCard />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should handle both inputs filled correctly", () => {
    renderWithAuth(<SignInCard />);

    const emailInput = screen.getByPlaceholderText("johndoe@gmail.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "SecurePass123!" } });

    expect(emailInput).toHaveValue("user@example.com");
    expect(passwordInput).toHaveValue("SecurePass123!");
  });

  it("should render auth card", () => {
    const { container } = renderWithAuth(<SignInCard />);

    const card = container.querySelector(".rounded-2xl");
    expect(card).toBeInTheDocument();
<<<<<<< HEAD
    expect(card?.className).toContain("fb-auth-card");
  });

  it("should render divider text correctly", () => {
    renderWithAuth(<Login />);

    expect(screen.getByText("Or continue with")).toBeInTheDocument();
=======
    expect(card?.className).toContain("bg-[#160a28]/95");
>>>>>>> origin/main
  });

  it("should display icons for form inputs", () => {
    const { container } = renderWithAuth(<SignInCard />);

    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should handle empty form submission", () => {
    renderWithAuth(<SignInCard />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(submitButton);

<<<<<<< HEAD
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
=======
    expect(screen.getByPlaceholderText("johndoe@gmail.com")).toHaveValue("");
    expect(screen.getByPlaceholderText("••••••••")).toHaveValue("");
>>>>>>> origin/main
  });

  it("should handle email input blur event", () => {
    renderWithAuth(<SignInCard />);

    const emailInput = screen.getByPlaceholderText("johndoe@gmail.com");
    fireEvent.change(emailInput, { target: { value: "test@email.com" } });
    fireEvent.blur(emailInput);

    expect(emailInput).toHaveValue("test@email.com");
  });

  it("should handle password input blur event", () => {
    renderWithAuth(<SignInCard />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });
    fireEvent.blur(passwordInput);

    expect(passwordInput).toHaveValue("mypassword");
  });

  it("should render submit button with full width", () => {
    renderWithAuth(<SignInCard />);

    expect(screen.getByRole("button", { name: /Sign In/i })).toHaveClass("w-full");
  });
});
