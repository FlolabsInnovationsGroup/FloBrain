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
  },
}));

describe("ProfileSettings Component", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockImplementation(() => false);
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

  it("should display profile data from API on main view", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeDefined();
    });
    expect(screen.getByText("john.doe@example.com")).toBeDefined();
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

  it("should update email in modal when user types", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "jane.smith@example.com" } });
    expect(emailInput.value).toBe("jane.smith@example.com");
  });

  it("should display current plan information", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByText(/developer/i)).toBeDefined();
    });
    expect(screen.getByText(/free/i)).toBeDefined();
  });

  it("should have upgrade link to pricing page", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /upgrade now/i })).toBeDefined();
    });
    const upgradeLink = screen.getByRole("link", {
      name: /upgrade now/i,
    }) as HTMLAnchorElement;
    expect(upgradeLink.getAttribute("href")).toBe("/pricing");
  });

  it("should show confirmation dialog when delete account is clicked", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete account/i })).toBeDefined();
    });
    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    fireEvent.click(deleteButton);
    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
  });

  it("should log deletion when user confirms delete", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const consoleSpy = vi.spyOn(console, "warn");
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete account/i })).toBeDefined();
    });
    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    fireEvent.click(deleteButton);
    expect(consoleSpy).toHaveBeenCalledWith("Deleting account...");
  });

  it("should not log deletion when user cancels confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const consoleSpy = vi.spyOn(console, "warn");
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete account/i })).toBeDefined();
    });
    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    fireEvent.click(deleteButton);
    expect(consoleSpy).not.toHaveBeenCalledWith("Deleting account...");
  });

  it("should have proper input types in Edit modal", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(nameInput.getAttribute("type")).toBe("text");
    expect(emailInput.getAttribute("type")).toBe("email");
  });

  it("should apply correct styling to delete button", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete account/i })).toBeDefined();
    });
    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    expect(deleteButton.className).toContain("E07A5F");
  });

  it("should show Save button in Edit modal", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("button", { name: /^save$/i })).toBeDefined();
  });

  it("should close Edit modal when Cancel is clicked", async () => {
    render(<ProfileSettings />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("dialog")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
