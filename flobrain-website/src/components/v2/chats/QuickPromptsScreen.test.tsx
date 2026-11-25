import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuickPromptsScreen, filterQuickPrompts } from "./QuickPromptsScreen";

describe("filterQuickPrompts", () => {
  it("filters by category and search text", () => {
    expect(filterQuickPrompts("all", "")).toHaveLength(4);
    expect(filterQuickPrompts("writing", "").map((p) => p.title)).toEqual(["Write a case study"]);
    expect(filterQuickPrompts("all", "milestones").map((p) => p.title)).toEqual(["Plan a project"]);
  });
});

describe("QuickPromptsScreen", () => {
  it("renders the four prompts and filters with the chips", () => {
    render(<QuickPromptsScreen />);
    expect(screen.getAllByRole("link")).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: "Planning" }));
    expect(screen.getByRole("button", { name: "Planning" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Plan a project/ })).toHaveAttribute(
      "href",
      expect.stringContaining("/chats?prompt=")
    );
  });

  it("shows an empty message when nothing matches", () => {
    render(<QuickPromptsScreen />);
    fireEvent.change(screen.getByLabelText("Search prompts"), { target: { value: "zzz" } });
    expect(screen.getByText("No prompts match your search.")).toBeInTheDocument();
  });
});
