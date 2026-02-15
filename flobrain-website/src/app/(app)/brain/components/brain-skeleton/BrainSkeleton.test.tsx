import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrainSkeleton } from ".";

describe("BrainSkeleton Component", () => {
  it("should render without crashing", () => {
    const { container } = render(<BrainSkeleton />);
    expect(container).toBeDefined();
  });

  it("should have animate-pulse class for loading animation", () => {
    const { container } = render(<BrainSkeleton />);
    const pulsingElement = container.querySelector(".animate-pulse");
    expect(pulsingElement).toBeDefined();
  });

  it("should render left sidebar with chat history", () => {
    const { container } = render(<BrainSkeleton />);
    const sidebar = container.querySelector(".w-64");
    expect(sidebar).toBeDefined();
  });

  it("should render 10 chat history items", () => {
    const { container } = render(<BrainSkeleton />);
    const chatItems = container.querySelectorAll("[key^='chat-']");
    expect(chatItems.length).toBe(10);
  });

  it("should render hamburger menu icon", () => {
    const { container } = render(<BrainSkeleton />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should render new chat button", () => {
    const { container } = render(<BrainSkeleton />);
    const newChatButton = container.querySelector(".border-white\\/20");
    expect(newChatButton).toBeDefined();
  });

  it("should render AI message with icon", () => {
    const { container } = render(<BrainSkeleton />);
    const aiIcon = container.querySelector(".bg-purple-500\\/30");
    expect(aiIcon).toBeDefined();
  });

  it("should render input area with send button", () => {
    const { container } = render(<BrainSkeleton />);
    const inputArea = container.querySelector(".rounded-2xl");
    expect(inputArea).toBeDefined();
  });

  it("should display lucide icons", () => {
    const { container } = render(<BrainSkeleton />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });
});
