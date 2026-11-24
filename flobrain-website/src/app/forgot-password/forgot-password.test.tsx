import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ForgotPassword from "./page";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Forgot password", () => {
  it("shows the invalid email state", () => {
    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "sarah@" } });
    fireEvent.click(screen.getByRole("button", { name: "Send recovery link" }));
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
  });

  it("shows the sent-link state", async () => {
    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "sarah.chen@company.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send recovery link" }));
    expect(await screen.findByRole("heading", { name: "We've sent you a link" })).toBeInTheDocument();
    expect(screen.getByText("sarah.chen@company.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend email" })).toBeInTheDocument();
  });
});
