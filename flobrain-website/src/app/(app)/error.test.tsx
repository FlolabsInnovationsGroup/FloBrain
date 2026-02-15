import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ErrorPage from "./error";

describe("Error Component", () => {
  const mockError: Parameters<typeof ErrorPage>[0]["error"] = {
    name: "Error",
    message: "Test error message",
  } as Parameters<typeof ErrorPage>[0]["error"];
  const mockReset = vi.fn();

  it("should render without crashing", () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(container).toBeDefined();
  });

  it("should display error title", () => {
    const { getByText } = render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(getByText("Something went wrong!")).toBeDefined();
  });

  it("should display error message", () => {
    const { getByText } = render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(getByText("Test error message")).toBeDefined();
  });

  it("should call reset function when Try Again is clicked", () => {
    const { getByText } = render(<ErrorPage error={mockError} reset={mockReset} />);
    const tryAgainButton = getByText("Try Again");

    fireEvent.click(tryAgainButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should render Go Home link", () => {
    const { getByText } = render(<ErrorPage error={mockError} reset={mockReset} />);
    const goHomeLink = getByText("Go Home");
    expect(goHomeLink).toBeDefined();
    expect(goHomeLink.closest("a")).toHaveProperty("href");
  });

  it("should display alert icon", () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
    const alertIcon = container.querySelector("svg");
    expect(alertIcon).toBeDefined();
  });
});
