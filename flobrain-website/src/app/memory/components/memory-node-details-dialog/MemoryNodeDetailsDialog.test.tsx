import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryNodeDetailsDialog } from "./index";
import React, { ReactNode } from "react";

// ✅ Define proper interfaces for the mock components
interface DialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogDescriptionProps {
  children: ReactNode;
}

// Mock the dialog components with proper types
vi.mock("@/components/layout/dialog", () => ({
  Dialog: ({ children, open }: DialogProps) => {
    return open ? <div data-testid="dialog-mock">{children}</div> : null;
  },
  DialogContent: ({ children, className }: DialogContentProps) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: DialogHeaderProps) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: DialogTitleProps) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: DialogDescriptionProps) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}));

describe("MemoryNodeDetailsDialog Component", () => {
  it("should not render when open is false", () => {
    const setOpen = vi.fn();
    render(
      <MemoryNodeDetailsDialog open={false} setOpen={setOpen} node={{ name: "Test" }} />
    );

    const dialog = screen.queryByTestId("dialog-mock");
    expect(dialog).toBeNull();
  });

  it("should render when open is true", () => {
    const setOpen = vi.fn();
    render(
      <MemoryNodeDetailsDialog open={true} setOpen={setOpen} node={{ name: "Test description" }} />
    );

    const dialog = screen.getByTestId("dialog-mock");
    expect(dialog).toBeDefined();
  });

  it("should display the correct title", () => {
    const setOpen = vi.fn();
    render(
      <MemoryNodeDetailsDialog open={true} setOpen={setOpen} node={{ name: "Test" }} />
    );

    const title = screen.getByTestId("dialog-title");
    expect(title.textContent).toBe("Memory node");
  });

  it("should display the node name as description", () => {
    const setOpen = vi.fn();
    const name = "This is a test memory node";
    render(<MemoryNodeDetailsDialog open={true} setOpen={setOpen} node={{ name }} />);

    const descriptionElement = screen.getByTestId("dialog-description");
    expect(descriptionElement.textContent).toBe(name);
  });

  it("should show No description when node is null or has no name", () => {
    const setOpen = vi.fn();
    render(<MemoryNodeDetailsDialog open={true} setOpen={setOpen} node={null} />);

    const descriptionElement = screen.getByTestId("dialog-description");
    expect(descriptionElement.textContent).toBe("No description");
  });

  it("should apply the correct className to DialogContent", () => {
    const setOpen = vi.fn();
    render(<MemoryNodeDetailsDialog open={true} setOpen={setOpen} node={{ name: "Test" }} />);

    const content = screen.getByTestId("dialog-content");
    expect(content.className).toContain("fb-memory-panel");
  });
});
