import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeroSection } from ".";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  },
}));

vi.mock("../../../../../assets/images/brain.svg", () => ({
  default: "brain-svg-mock",
}));

describe("HeroSection Component", () => {
  it("should render the main headings correctly", () => {
    render(<HeroSection />);
    expect(screen.getByText("THE INTELLIGENCE LAYER")).toBeDefined();
    expect(screen.getByText("FOR EVERY DEVICE")).toBeDefined();
  });

  it("should render the description paragraph", () => {
    render(<HeroSection />);
    expect(screen.getByText(/FloBrain is the central intelligence layer/i)).toBeDefined();
  });

  it("should render a single h1 with the full tagline", () => {
    render(<HeroSection />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("The Intelligence Layer for Every Device");
  });

  it("should render the decorative hero image with empty alt text", () => {
    const { container } = render(<HeroSection />);
    const image = container.querySelector('img[alt=""]');
    expect(image).not.toBeNull();
    expect(image?.getAttribute("src")).toBeTruthy();
  });
});
