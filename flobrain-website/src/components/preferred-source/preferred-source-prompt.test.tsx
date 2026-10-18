import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreferredSourcePrompt } from "./preferred-source-prompt";
import { PREFERRED_SOURCE_DEEPLINK, PREFERRED_SOURCE_PROMPT_KEY } from "./preferred-source";

describe("PreferredSourcePrompt", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("asks once on open and stays dismissed after Not now", async () => {
    const { unmount } = render(<PreferredSourcePrompt />);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await screen.findByRole("dialog")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(localStorage.getItem(PREFERRED_SOURCE_PROMPT_KEY)).toBe("dismissed");

    unmount();
    render(<PreferredSourcePrompt />);
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens Google's preferred-source page when OK is chosen", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<PreferredSourcePrompt />);

    fireEvent.click(await screen.findByRole("button", { name: "OK" }));

    expect(open).toHaveBeenCalledWith(PREFERRED_SOURCE_DEEPLINK, "_blank", "noopener,noreferrer");
    expect(localStorage.getItem(PREFERRED_SOURCE_PROMPT_KEY)).toBe("accepted");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
