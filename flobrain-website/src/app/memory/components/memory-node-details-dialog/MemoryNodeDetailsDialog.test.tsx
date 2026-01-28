import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryNodeDetailsDialog } from "./index";

// Mock the dialog components
vi.mock("@/components/layout/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => {
    return open ? <div data-testid="dialog-mock">{children}</div> : null;
  },
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: any) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}));

describe("MemoryNodeDetailsDialog Component", () => {
  it("should not render when open is false", () => {
    const setOpen = vi.fn();
    render(
      <MemoryNodeDetailsDialog
        open={false}
        setOpen={setOpen}
        description="Test description"
      />
    );
    
    const dialog = screen.queryByTestId("dialog-mock");
    expect(dialog).toBeNull();
  });

  it("should render when open is true", () => {
    const setOpen = vi.fn();
    render(
      <MemoryNodeDetailsDialog
        open={true}
        setOpen={setOpen}
        description="Test description"
      />
    );
    
    const dialog = screen.getByTestId("dialog-mock");
    expect(dialog).toBeDefined();
  });

  it("should display the correct title", () => {
    const setOpen = vi.fn();
    render(
      <MemoryNodeDetailsDialog
        open={true}
        setOpen={setOpen}
        description="Test description"
      />
    );
    
    const title = screen.getByTestId("dialog-title");
    expect(title.textContent).toBe("Memory node");
  });

  it("should display the provided description", () => {
    const setOpen = vi.fn();
    const description = "This is a test memory node";
    render(
      <MemoryNodeDetailsDialog
        open={true}
        setOpen={setOpen}
        description={description}
      />
    );
    
    const descriptionElement = screen.getByTestId("dialog-description");
    expect(descriptionElement.textContent).toBe(description);
  });

  it("should handle null description", () => {
    const setOpen = vi.fn();
    render(
      <MemoryNodeDetailsDialog
        open={true}
        setOpen={setOpen}
        description={null}
      />
    );
    
    const descriptionElement = screen.getByTestId("dialog-description");
    expect(descriptionElement).toBeDefined();
  });

  it("should apply the correct className to DialogContent", () => {
    const setOpen = vi.fn();
    render(
      <MemoryNodeDetailsDialog
        open={true}
        setOpen={setOpen}
        description="Test"
      />
    );
    
    const content = screen.getByTestId("dialog-content");
    expect(content.className).toContain("bg-black text-white");
  });
});
