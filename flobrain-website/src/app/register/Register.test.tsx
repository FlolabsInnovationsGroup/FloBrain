import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterCard } from "./register-card";
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
    renderWithAuth(<RegisterCard />);

    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("should render social login buttons", () => {
    renderWithAuth(<RegisterCard />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
  });

  it("should update name input value when user types", () => {
    renderWithAuth(<RegisterCard />);

    const nameInput = screen.getByPlaceholderText("John Doe");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    expect(nameInput).toHaveValue("John Doe");
  });

  it("should update email input value when user types", () => {
    renderWithAuth(<RegisterCard />);

    const emailInput = screen.getByPlaceholderText("johndoe@gmail.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should update password input value when user types", () => {
    renderWithAuth(<RegisterCard />);

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwordInputs[0];
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(passwordInput).toHaveValue("password123");
  });

  it("should update confirm password input value when user types", () => {
    renderWithAuth(<RegisterCard />);

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const confirmPasswordInput = passwordInputs[1];
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });

    expect(confirmPasswordInput).toHaveValue("password123");
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    renderWithAuth(<RegisterCard />);

    const passwordInput = screen.getAllByPlaceholderText("••••••••")[0];

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should toggle confirm password visibility when eye icon is clicked", () => {
    renderWithAuth(<RegisterCard />);

    const confirmPasswordInput = screen.getAllByPlaceholderText("••••••••")[1];

    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: /show confirm password/i }));
    expect(confirmPasswordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /hide confirm password/i }));
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("should render sign in link", () => {
    renderWithAuth(<RegisterCard />);

    const signInLink = screen.getByText("Login");
    expect(signInLink).toHaveAttribute("href", "/signin");
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
  });

  it("should render create account button", () => {
    renderWithAuth(<RegisterCard />);

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should handle all inputs filled correctly", () => {
    renderWithAuth(<RegisterCard />);

    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("johndoe@gmail.com");
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

  it("should render auth card", () => {
    const { container } = renderWithAuth(<RegisterCard />);

    const card = container.querySelector(".rounded-2xl");
    expect(card).toBeInTheDocument();
    expect(card?.className).toContain("bg-[#160a28]/95");
  });

  it("should display icons for form inputs", () => {
    const { container } = renderWithAuth(<RegisterCard />);

    const mailIcon = container.querySelector("svg");
    expect(mailIcon).toBeInTheDocument();
  });

  it("should handle empty form submission", () => {
    renderWithAuth(<RegisterCard />);

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    fireEvent.click(submitButton);

    expect(screen.getByPlaceholderText("John Doe")).toHaveValue("");
    expect(screen.getByPlaceholderText("johndoe@gmail.com")).toHaveValue("");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    expect(passwordInputs[0]).toHaveValue("");
    expect(passwordInputs[1]).toHaveValue("");
  });
});
