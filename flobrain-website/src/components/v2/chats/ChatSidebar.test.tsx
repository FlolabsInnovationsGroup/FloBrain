import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { ChatSidebar, isChatNavActive } from "./ChatSidebar";

describe("isChatNavActive", () => {
  it("keeps Chats active for saved and document chats only", () => {
    expect(isChatNavActive("/chats", "/chats")).toBe(false);
    expect(isChatNavActive("/chats", "/chats/benefits-of-ux-design")).toBe(true);
    expect(isChatNavActive("/chats", "/chats/document")).toBe(true);
    expect(isChatNavActive("/chats", "/chats/rooms/product-design-team")).toBe(false);
    expect(isChatNavActive("/chats/rooms", "/chats/rooms/product-design-team")).toBe(true);
    expect(isChatNavActive("/chats/prompts", "/chats/prompts")).toBe(true);
  });
});

describe("ChatSidebar", () => {
  it("marks the current section and filters recent chats", () => {
    vi.mocked(usePathname).mockReturnValue("/chats/prompts");
    render(<ChatSidebar />);
    expect(screen.getByRole("link", { name: "Quick prompts" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Website launch plan" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search chats"), { target: { value: "ux" } });
    expect(screen.getByRole("link", { name: "Benefits of UX design" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Website launch plan" })).not.toBeInTheDocument();
  });
});
