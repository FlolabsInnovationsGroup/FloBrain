import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import Navbar from ".";
import { AuthProvider } from "@/contexts/AuthContext";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @next/next/no-img-element
  default: (props: any) => <img alt="" {...props} data-testid="mock-hero-image" />,
}));

vi.mock("../../../../assets/images/flolabs-logo.svg", () => ({
  default: "logo-mock",
}));

function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe("Navbar Component", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("should render the logo and brand name", () => {
    renderWithAuth(<Navbar />);
    expect(screen.getByAltText("FloBrain")).toBeDefined();
    expect(screen.getByText("FloBrain")).toBeDefined();
  });

  it("should render desktop navigation links", async () => {
    renderWithAuth(<Navbar />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Sign In/i })).toBeInTheDocument();
    });
    const signInLink = screen.getByRole("link", { name: /Sign In/i });
    const registerLink = screen.getByRole("link", { name: /Register/i });

    expect(signInLink).toBeDefined();
    expect(registerLink).toBeDefined();
    expect(signInLink.getAttribute("href")).toBe("/signin");
    expect(registerLink.getAttribute("href")).toBe("/register");
  });

  it("should toggle mobile menu when hamburger button is clicked", async () => {
    renderWithAuth(<Navbar />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Sign In/i })).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole("button", { name: "Open menu" });
    const signInLinksBefore = screen.getAllByText(/Sign In/i);
    expect(signInLinksBefore.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(toggleButton);

    const signInLinksAfter = screen.getAllByText(/Sign In/i);
    expect(signInLinksAfter.length).toBeGreaterThanOrEqual(2);
  });

  it("should close mobile menu when a link is clicked", async () => {
    renderWithAuth(<Navbar />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Sign In/i })).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(toggleButton);

    const mobileLinks = screen.getAllByText(/Sign In/i);
    expect(mobileLinks.length).toBeGreaterThanOrEqual(2);

    const mobileSignInLink = mobileLinks[mobileLinks.length - 1];
    fireEvent.click(mobileSignInLink);

    const finalLinks = screen.getAllByText(/Sign In/i);
    expect(finalLinks.length).toBeLessThan(mobileLinks.length);
  });

  it("should render the app navigation links when signed in", async () => {
    localStorage.setItem("flobrain_access_token", "test-token");
    localStorage.setItem("flobrain_user_id", "test-user");

    renderWithAuth(<Navbar />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    });

    const expected = [
      ["Home", "/"],
      ["Chat", "/brain"],
      ["Dashboard", "/dashboard"],
      ["Activity", "/home"],
      ["Memory", "/memory"],
      ["Models", "/models"],
    ];

    for (const [label, href] of expected) {
      expect(screen.getByRole("link", { name: label }).getAttribute("href")).toBe(href);
    }

    expect(screen.queryByRole("link", { name: /Sign In/i })).toBeNull();
  });

  it("should mark only the current route as active", async () => {
    localStorage.setItem("flobrain_access_token", "test-token");
    localStorage.setItem("flobrain_user_id", "test-user");

    renderWithAuth(<Navbar />);

    // Wait on an authed-only link: "Home" also renders in the signed-out branch,
    // so waiting on it would resolve before AuthProvider settles.
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Activity" })).toBeInTheDocument();
    });

    // usePathname is mocked to "/" — Home is active, Activity ("/home") is not.
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Activity" })).not.toHaveAttribute("aria-current");
  });
});
