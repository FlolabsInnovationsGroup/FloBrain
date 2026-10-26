import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Navbar from "../layout/navbar";
import LeadershipPreviewHeader from "./LeadershipPreviewHeader";

vi.mock("next-themes", () => ({ useTheme: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));
vi.mock("next/image", () => ({ default: () => null }));

const setTheme = vi.fn();

beforeEach(() => {
  setTheme.mockClear();
  vi.mocked(usePathname).mockReturnValue("/");
  vi.mocked(useTheme).mockReturnValue({
    resolvedTheme: "dark",
    setTheme,
    themes: ["light", "dark"],
  });
});

describe("Leadership preview header isolation", () => {
  it("hides the shared navbar only on the exact preview route", () => {
    vi.mocked(usePathname).mockReturnValue("/leadership-preview");
    const { rerender } = render(<Navbar />);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    for (const path of ["/", "/brain", "/dashboard", "/leadership-preview/other"]) {
      vi.mocked(usePathname).mockReturnValue(path);
      rerender(<Navbar />);
      expect(screen.getByRole("banner")).toBeInTheDocument();
    }
  });

  it("switches from dark to light and from light to dark", () => {
    const { rerender } = render(<LeadershipPreviewHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle light and dark theme" }));
    expect(setTheme).toHaveBeenLastCalledWith("light");
    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme: "light",
      setTheme,
      themes: ["light", "dark"],
    });
    rerender(<LeadershipPreviewHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle light and dark theme" }));
    expect(setTheme).toHaveBeenLastCalledWith("dark");
  });
});
