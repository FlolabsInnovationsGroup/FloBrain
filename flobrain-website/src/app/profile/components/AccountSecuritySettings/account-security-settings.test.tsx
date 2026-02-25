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

  it("should render all password input fields", () => {
    render(<AccountSecuritySettings />);
    
    expect(screen.getByLabelText(/current password/i)).toBeDefined();
    expect(screen.getByLabelText(/new password/i)).toBeDefined();
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
  });

  it("should render password fields with correct type attribute", () => {
    render(<AccountSecuritySettings />);
    
    expect(screen.getByLabelText(/current password/i).getAttribute('type')).toBe('password');
    expect(screen.getByLabelText(/new password/i).getAttribute('type')).toBe('password');
    expect(screen.getByLabelText(/confirm password/i).getAttribute('type')).toBe('password');
  });

  it("should update current password when user types", () => {
    render(<AccountSecuritySettings />);
    
    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i) as HTMLInputElement;
    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword123' } });
    
    expect(currentPasswordInput.value).toBe('oldpassword123');
  });

  it("should update new password when user types", () => {
    render(<AccountSecuritySettings />);
    
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i) as HTMLInputElement;
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword456' } });
    
    expect(newPasswordInput.value).toBe('newpassword456');
  });

  it("should update confirm password when user types", () => {
    render(<AccountSecuritySettings />);
    
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i) as HTMLInputElement;
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword456' } });
    
    expect(confirmPasswordInput.value).toBe('newpassword456');
  });

  it("should render 2FA section with title and description", () => {
    render(<AccountSecuritySettings />);
    
    expect(screen.getByText(/two-factor authentication \(2fa\)/i)).toBeDefined();
    expect(screen.getByText(/add an extra layer of security to your account/i)).toBeDefined();
  });

  it("should render 2FA toggle button in disabled state by default", () => {
    const { container } = render(<AccountSecuritySettings />);
    
    const toggle = container.querySelector('button[class*="bg-gray-600"]');
    expect(toggle).toBeTruthy();
  });

  it("should toggle 2FA to enabled state when clicked", () => {
    const { container } = render(<AccountSecuritySettings />);
    
    const toggle = container.querySelector('button[class*="rounded-full"]');
    expect(toggle).toBeTruthy();
    
    if (toggle) {
      fireEvent.click(toggle);
      expect(toggle.className).toContain('bg-green-500');
    }
  });

  it("should toggle 2FA back to disabled when clicked twice", () => {
    const { container } = render(<AccountSecuritySettings />);
    
    const toggle = container.querySelector('button[class*="rounded-full"]');
    expect(toggle).toBeTruthy();
    
    if (toggle) {
      fireEvent.click(toggle); // Enable
      fireEvent.click(toggle); // Disable
      expect(toggle.className).toContain('bg-gray-600');
    }
  });

  it("should initialize all password fields as empty", () => {
    render(<AccountSecuritySettings />);
    
    const currentPassword = screen.getByLabelText(/current password/i) as HTMLInputElement;
    const newPassword = screen.getByLabelText(/new password/i) as HTMLInputElement;
    const confirmPassword = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
    
    expect(currentPassword.value).toBe('');
    expect(newPassword.value).toBe('');
    expect(confirmPassword.value).toBe('');
  });

  it("should display correct placeholder text for all password fields", () => {
    render(<AccountSecuritySettings />);
    
    expect(screen.getByPlaceholderText(/enter current password/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/enter new password/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/confirm new password/i)).toBeDefined();
  });

  it("should render 2FA as a subheading", () => {
    render(<AccountSecuritySettings />);
    
    const heading = screen.getByText(/two-factor authentication \(2fa\)/i);
    expect(heading).toBeDefined();
    expect(heading.tagName).toBe('H3');
  });
});
