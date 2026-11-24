import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignInCard } from "./signin-card";
import { AuthProvider } from "@/contexts/AuthContext";

const { signIn } = vi.hoisted(() => ({
  signIn: vi.fn(async (_email: string, _password: string) => ({
    error: "Invalid credentials",
    status: 401,
  })),
}));

vi.mock("@/lib/api", () => ({
  api: {
    signIn,
    register: vi.fn(),
    signOut: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

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
    localStorage.clear();
  });

  it("should render all form fields correctly", () => {
    renderWithAuth(<SignInCard />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@flobrain.com")).toBeInTheDocument();
    expect(screen.getByText("Welcome to Flobabs Innovations")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lead" })).toHaveAttribute("aria-pressed", "true");
  });

  it("should hide social login buttons", () => {
    renderWithAuth(<SignInCard />);

    expect(screen.queryByText("Continue with Google")).not.toBeInTheDocument();
    expect(screen.queryByText("Continue with Apple")).not.toBeInTheDocument();
  });

  it("should update username and password when the user types", () => {
    renderWithAuth(<SignInCard />);

    const username = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    fireEvent.change(username, { target: { value: "test@example.com" } });
    fireEvent.change(password, { target: { value: "password123" } });

    expect(username).toHaveValue("test@example.com");
    expect(password).toHaveValue("password123");
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    renderWithAuth(<SignInCard />);

    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should render forgot password and activate links", () => {
    renderWithAuth(<SignInCard />);

    expect(screen.getByText("Forgot password?")).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByText("Activate your account")).toHaveAttribute("href", "/register");
    expect(screen.getByText(/Have an invite\?/i)).toBeInTheDocument();
  });

  it("should render the log in button", () => {
    renderWithAuth(<SignInCard />);

    expect(screen.getByRole("button", { name: "LOG IN" })).toHaveClass("w-full");
  });

  it("should show validation when the form is empty", () => {
    renderWithAuth(<SignInCard />);

    fireEvent.click(screen.getByRole("button", { name: "LOG IN" }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("should show the designed credential error when sign in fails", async () => {
    renderWithAuth(<SignInCard />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "you@flobrain.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "LOG IN" }));

    expect(
      await screen.findByText("The email or password you entered is incorrect. Please try again.")
    ).toBeInTheDocument();
  });
});
