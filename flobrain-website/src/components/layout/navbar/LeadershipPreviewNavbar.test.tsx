import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Navbar from ".";
import LeadershipPreview from "@/app/leadership-preview/page";

vi.mock("next-themes", () => ({ useTheme: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));
vi.mock("next/image", () => ({ default: () => <span aria-label="FloBrain logo" /> }));

const setTheme = vi.fn();

beforeEach(() => {
  setTheme.mockClear();
  vi.mocked(usePathname).mockReturnValue("/leadership-preview");
  vi.mocked(useTheme).mockReturnValue({
    resolvedTheme: "dark",
    setTheme,
    themes: ["light", "dark"],
  });
});

describe("Shared V1 navbar on Leadership preview", () => {
  it("renders one navbar above the unchanged preview, in normal document flow", () => {
    render(
      <>
        <Navbar />
        <LeadershipPreview />
      </>
    );
    const header = screen.getByRole("banner");
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(header).toHaveClass("relative");
    expect(header).not.toHaveClass("fixed", "sticky");
    expect(screen.getByLabelText("FloBrain logo")).toBeInTheDocument();
    for (const [name, href] of [
      ["Home", "/"],
      ["Chat", "/brain"],
      ["Dashboard", "/dashboard"],
    ]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
    expect(screen.getByRole("heading", { name: "Leadership Dashboard" })).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(3);
  });

  it("preserves the mobile menu and existing theme toggle", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getAllByRole("link", { name: "Chat" })).toHaveLength(2);
    const links = screen.getAllByRole("link", { name: "Chat" });
    fireEvent.click(links[1]);
    expect(screen.getAllByRole("link", { name: "Chat" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("keeps existing positioning and active links on other routes", () => {
    const { rerender } = render(<Navbar />);
    for (const [path, position, active] of [
      ["/", "sticky", "Home"],
      ["/brain", "sticky", "Chat"],
      ["/dashboard", "hidden", "Dashboard"],
      ["/memory", "fixed", null],
    ] as const) {
      vi.mocked(usePathname).mockReturnValue(path);
      rerender(<Navbar />);
      const header = screen.getByRole("banner");
      expect(header).toHaveClass(position);
      if (active)
        expect(within(header).getByRole("link", { name: active })).toHaveAttribute(
          "aria-current",
          "page"
        );
    }
  });
});
