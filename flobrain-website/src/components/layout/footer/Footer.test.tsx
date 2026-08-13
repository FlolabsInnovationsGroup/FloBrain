import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from ".";
import { FOOTER_DESCRIPTION, FOOTER_SOCIAL } from "./constants";

describe("Footer Component", () => {
  it("should render within a semantic footer tag", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeDefined();
  });

  it("should render the brand lockup, byline and description", () => {
    render(<Footer />);
    expect(screen.getByText("FloBrain")).toBeDefined();
    expect(screen.getByText("by FloLabs Innovations Group")).toBeDefined();
    expect(screen.getByText(FOOTER_DESCRIPTION)).toBeDefined();
  });

  it("should render the newsletter form", () => {
    render(<Footer />);
    expect(screen.getByLabelText("Email address for newsletter")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Subscribe to newsletter" })
    ).toBeDefined();
  });

  it("should render every social link opening in a new tab", () => {
    render(<Footer />);
    for (const { label, href } of FOOTER_SOCIAL) {
      const link = screen.getByLabelText(label);
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("should render the three link sections", () => {
    render(<Footer />);
    // Each title renders twice: the mobile toggle label and the desktop heading.
    for (const title of ["Navigation", "Projects", "Company"]) {
      expect(screen.getAllByText(title)).toHaveLength(2);
    }
  });

  it("should render the navigation links", () => {
    const { container } = render(<Footer />);
    const footer = within(container.querySelector("footer")!);
    expect(footer.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/pricing"
    );
    expect(footer.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact"
    );
  });

  it("should toggle a collapsible section on mobile", () => {
    render(<Footer />);
    const toggle = screen.getAllByRole("button", { expanded: false })[0];
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("should render the closing line", () => {
    render(<Footer />);
    expect(screen.getByText("Live Long and Prosper")).toBeDefined();
  });
});
