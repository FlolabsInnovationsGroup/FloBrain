import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ProfileSettings from "./index";

describe("ProfileSettings Component", () => {
  beforeEach(() => {
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => false);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should render profile settings form with all fields", () => {
    render(<ProfileSettings />);
    
    expect(screen.getByLabelText(/full name/i)).toBeDefined();
    expect(screen.getByLabelText(/email address/i)).toBeDefined();
    expect(screen.getByLabelText(/bio/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /delete account/i })).toBeDefined();
  });

  it("should display pre-filled user data", () => {
    render(<ProfileSettings />);
    
    const nameInput = screen.getByDisplayValue('John Doe');
    const emailInput = screen.getByDisplayValue('john.doe@example.com');
    
    expect(nameInput).toBeDefined();
    expect(emailInput).toBeDefined();
  });

  it("should update full name field when user types", () => {
    render(<ProfileSettings />);
    
    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    
    expect(nameInput.value).toBe('Jane Smith');
  });

  it("should update email field when user types", () => {
    render(<ProfileSettings />);
    
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });
    
    expect(emailInput.value).toBe('jane.smith@example.com');
  });

  it("should update bio field when user types", () => {
    render(<ProfileSettings />);
    
    const bioTextarea = screen.getByLabelText(/bio/i) as HTMLTextAreaElement;
    fireEvent.change(bioTextarea, { target: { value: 'Software engineer with passion for AI' } });
    
    expect(bioTextarea.value).toBe('Software engineer with passion for AI');
  });

  it("should display bio placeholder text when empty", () => {
    render(<ProfileSettings />);
    
    const bioTextarea = screen.getByPlaceholderText(/tell us a little about yourself/i);
    expect(bioTextarea).toBeDefined();
  });

  it("should show confirmation dialog when delete account is clicked", () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<ProfileSettings />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    
    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
  });

  it("should log deletion when user confirms delete", () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<ProfileSettings />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Deleting account...');
  });

  it("should not log deletion when user cancels confirmation", () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<ProfileSettings />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    
    expect(consoleSpy).not.toHaveBeenCalledWith('Deleting account...');
  });

  it("should have proper input types for accessibility", () => {
    render(<ProfileSettings />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    
    expect(nameInput.getAttribute('type')).toBe('text');
    expect(emailInput.getAttribute('type')).toBe('email');
  });

  it("should apply correct styling to delete button", () => {
    render(<ProfileSettings />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    expect(deleteButton.className).toContain('bg-red-600/80');
  });

  it("should render Profile Settings heading", () => {
    render(<ProfileSettings />);
    
    const heading = screen.getByRole('heading', { name: /profile settings/i });
    expect(heading).toBeDefined();
    expect(heading.tagName).toBe('H2');
  });
});
