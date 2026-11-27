import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Register from "./page";
import { AuthProvider } from "@/contexts/AuthContext";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
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
    sessionStorage.clear();
  });

  it("should render the activation form", () => {
    renderWithAuth(<Register />);
    expect(screen.getByRole("heading", { name: "Activate your account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Create new password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    expect(screen.queryByText("Continue with Google")).not.toBeInTheDocument();
  });

  it("should update the username and passwords", () => {
    renderWithAuth(<Register />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "sarah.chen@company.com" },
    });
    fireEvent.change(screen.getByLabelText("Create new password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "Password1!" },
    });
    expect(screen.getByLabelText("Email")).toHaveValue("sarah.chen@company.com");
    expect(screen.getByLabelText("Create new password")).toHaveValue("Password1!");
  });

  it("should toggle password visibility", () => {
    renderWithAuth(<Register />);
    const password = screen.getByLabelText("Create new password");
    const toggles = screen.getAllByRole("button", { name: /show password/i });
    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(toggles[0]);
    expect(password).toHaveAttribute("type", "text");
  });

  it("should show the length error from the design", () => {
    renderWithAuth(<Register />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "sarah.chen@company.com" },
    });
    fireEvent.change(screen.getByLabelText("Create new password"), {
      target: { value: "Ab1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "Ab1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save and Continue" }));
    expect(screen.getByText("Password must be at least 8 characters long.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("should continue to phone setup when the password is valid", () => {
    renderWithAuth(<Register />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "sarah.chen@company.com" },
    });
    fireEvent.change(screen.getByLabelText("Create new password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save and Continue" }));
    expect(push).toHaveBeenCalledWith("/register/phone");
    expect(sessionStorage.getItem("flobrain_activation_draft")).toContain("sarah.chen@company.com");
  });
});
