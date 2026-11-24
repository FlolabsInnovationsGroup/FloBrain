import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ResetPasswordPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Reset password", () => {
  it("shows the mismatch error", () => {
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "Password2!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("shows the reset success state", () => {
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
    expect(screen.getByRole("heading", { name: "Your password has been reset" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Return to sign in" })).toBeInTheDocument();
  });
});
