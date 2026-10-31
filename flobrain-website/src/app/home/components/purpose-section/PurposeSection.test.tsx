import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PurposeSection } from ".";

describe("PurposeSection", () => {
  it("should render the shared purpose headline and column labels", () => {
    render(<PurposeSection />);

    expect(screen.getByText("Our shared purpose")).toBeDefined();
    expect(screen.getByRole("heading", { name: /Talent is everywhere/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Mission" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Vision" })).toBeDefined();
  });

  it("should link learning opportunities to the bootcamp", () => {
    render(<PurposeSection />);

    const link = screen.getByRole("link", { name: "Explore learning opportunities" });
    expect(link.getAttribute("href")).toBe("https://www.bootcampuniversity.org/");
    expect(link.getAttribute("target")).toBe("_blank");
  });
});
