import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ProfileSettings from "./index";

const mockProfile = {
  id: "1",
  fullName: "John Doe",
  email: "john.doe@example.com",
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    userId: "1",
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    getProfile: vi.fn(() =>
      Promise.resolve({ data: mockProfile, error: undefined, status: 200 })
    ),
    updateProfile: vi.fn((body: { fullName?: string; email?: string }) =>
      Promise.resolve({
        data: { ...mockProfile, ...body },
        error: undefined,
        status: 200,
      })
    ),
    deleteAccount: vi.fn(() =>
      Promise.resolve({ data: undefined, error: undefined, status: 200 })
    ),
  },
}));

describe("ProfileSettings Component", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should render name, email, Edit button, and other sections after load", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeDefined();
    });
    expect(screen.getByText("john.doe@example.com")).toBeDefined();
    expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    expect(screen.getByText(/current plan/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /upgrade now/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /delete account/i })).toBeDefined();
  });

  it("should open Edit modal when Edit is clicked", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByLabelText(/full name/i)).toBeDefined();
    expect(screen.getByLabelText(/email address/i)).toBeDefined();
  });

  it("should update full name in modal when user types", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Jane Smith" } });
    expect(nameInput.value).toBe("Jane Smith");
  });

  it("should display current plan information", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByText(/developer/i)).toBeDefined();
    });
    expect(screen.getByText(/free/i)).toBeDefined();
  });

  it("should open delete account modal when delete is clicked", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete account/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    expect(screen.getByRole("dialog", { name: /delete account/i })).toBeDefined();
    expect(screen.getByLabelText(/^password$/i)).toBeDefined();
  });

  it("should apply danger styling to delete button", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete account/i })).toBeDefined();
    });
    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    expect(deleteButton.className).toContain("fb-profile-btn-danger");
  });

  it("should close Edit modal when Cancel is clicked", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("dialog")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
