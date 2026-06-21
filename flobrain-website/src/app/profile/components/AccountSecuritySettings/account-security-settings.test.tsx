import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import AccountSecuritySettings from "./index";

describe("AccountSecuritySettings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render Change password button", () => {
    render(<AccountSecuritySettings />);
    expect(screen.getByRole("button", { name: /change password/i })).toBeDefined();
  });

  it("should open modal when Change password is clicked", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(screen.getByLabelText(/current password/i)).toBeDefined();
    expect(document.getElementById("modal-newPassword")).toBeDefined();
    expect(screen.getByLabelText(/confirm new password/i)).toBeDefined();
  });

  it("should show password fields with correct type in modal", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    expect(screen.getByLabelText(/current password/i).getAttribute("type")).toBe("password");
    expect(document.getElementById("modal-newPassword")?.getAttribute("type")).toBe("password");
    expect(screen.getByLabelText(/confirm new password/i).getAttribute("type")).toBe("password");
  });

  it("should update current password when user types in modal", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    const input = screen.getByPlaceholderText(/enter current password/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "oldpassword123" } });
    expect(input.value).toBe("oldpassword123");
  });

  it("should update new password when user types in modal", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    const input = screen.getByPlaceholderText(/enter new password/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "newpassword456" } });
    expect(input.value).toBe("newpassword456");
  });

  it("should update confirm password when user types in modal", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    const input = screen.getByPlaceholderText(/confirm new password/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "newpassword456" } });
    expect(input.value).toBe("newpassword456");
  });

  it("should close modal when Cancel is clicked", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    expect(screen.getByRole("dialog")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("should close modal when X (Close) is clicked", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    expect(screen.getByRole("dialog")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("should render Confirm button in modal", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    expect(screen.getByRole("button", { name: /^confirm$/i })).toBeDefined();
  });

  it("should render 2FA section with title and description", () => {
    render(<AccountSecuritySettings />);
    expect(screen.getByText(/two-factor authentication \(2fa\)/i)).toBeDefined();
    expect(screen.getByText(/add an extra layer of security to your account/i)).toBeDefined();
  });

  it("should render 2FA toggle in disabled state by default", () => {
    const { container } = render(<AccountSecuritySettings />);
    const toggle = container.querySelector('button[class*="bg-gray-600"]');
    expect(toggle).toBeTruthy();
  });

  it("should toggle 2FA to enabled when clicked", () => {
    const { container } = render(<AccountSecuritySettings />);
    const toggle = container.querySelector('button[class*="rounded-full"]');
    expect(toggle).toBeTruthy();
    if (toggle) {
      fireEvent.click(toggle);
      expect(toggle.className).toContain("bg-green-500");
    }
  });

  it("should have modal title Change password", () => {
    render(<AccountSecuritySettings />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "change-password-title");
    expect(document.getElementById("change-password-title")?.textContent).toBe("Change password");
  });
});
