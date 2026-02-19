import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryGraph } from "./index";
import React from "react";

// Mock the data
vi.mock("../../mockData", () => ({
  memoryNodes: [
    { id: "1", name: "Node A", group: 1 },
    { id: "2", name: "Node B", group: 2 },
  ],
  memoryLinks: [{ source: "1", target: "2" }],
}));

// Define proper types for mock props
interface MockForceGraphProps {
  graphData: {
    nodes: Array<{ id: string; name: string; group: number }>;
    links: Array<{ source: string; target: string }>;
  };
  width: number;
  height: number;
  onNodeClick?: (node: { id: string; name: string }) => void;
  [key: string]: unknown;
}

// Mock next/dynamic to return the mock component directly
vi.mock("next/dynamic", () => ({
  default: <T,>(_fn: () => Promise<T>) => {
    // Return a mock component that simulates ForceGraph2D
    return (props: MockForceGraphProps) => {
      return (
        <div data-testid="force-graph-mock">
          <button
            data-testid="simulate-node-click"
            onClick={() => {
              if (props.onNodeClick) {
                props.onNodeClick({ id: "1", name: "Node A" });
              }
            }}
          >
            Simulate Click
          </button>
          <span data-testid="node-count">{props.graphData.nodes.length}</span>
        </div>
      );
    };
  },
}));

describe("MemoryGraph Component", () => {
  beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the graph container", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    render(
      <MemoryGraph
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={false}
        setGraphActive={setGraphActive}
      />
    );
    expect(screen.getByTestId("force-graph-mock")).toBeDefined();
  });

  it("should pass the correct data to the graph", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    render(
      <MemoryGraph
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={false}
        setGraphActive={setGraphActive}
      />
    );
    expect(screen.getByTestId("node-count").textContent).toBe("2");
  });

  it("should call onOpenMemoryNodeDialog when a node is clicked and graph is active", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    render(
      <MemoryGraph
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={true}
        setGraphActive={setGraphActive}
      />
    );

    const simulateButton = screen.getByTestId("simulate-node-click");
    fireEvent.click(simulateButton);

    expect(onOpenDialog).toHaveBeenCalledTimes(1);
    expect(onOpenDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "1",
        name: "Node A",
      })
    );
  });

  it("should not call onOpenMemoryNodeDialog when graph is inactive", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    render(
      <MemoryGraph
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={false}
        setGraphActive={setGraphActive}
      />
    );

    const simulateButton = screen.getByTestId("simulate-node-click");
    fireEvent.click(simulateButton);

    expect(onOpenDialog).not.toHaveBeenCalled();
  });

  it("should handle window resize events", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    render(
      <MemoryGraph
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={false}
        setGraphActive={setGraphActive}
      />
    );

    act(() => {
      global.innerWidth = 500;
      global.dispatchEvent(new Event("resize"));
    });

    expect(screen.getByTestId("force-graph-mock")).toBeDefined();
  });

  it("should apply active border styling when graph is active", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    const { container } = render(
      <MemoryGraph
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={true}
        setGraphActive={setGraphActive}
      />
    );

    const graphBorder = container.querySelector('div[class*="border-4"]');
    expect(graphBorder).toBeTruthy();
    expect(graphBorder?.className).toContain("border-[#a78bfa]");
  });

  it("should apply inactive border styling when graph is inactive", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    const { container } = render(
      <MemoryGraph
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={false}
        setGraphActive={setGraphActive}
      />
    );

    const graphBorder = container.querySelector('div[class*="border-4"]');
    expect(graphBorder).toBeTruthy();
    expect(graphBorder?.className).toContain("border-[#4c1d95]/50");
  });

  it("should call setGraphActive when clicking graph area while inactive", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    const { container } = render(
      <MemoryGraph
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={false}
        setGraphActive={setGraphActive}
      />
    );

    const graphBorder = container.querySelector('div[class*="border-4"]');
    if (graphBorder) {
      fireEvent.click(graphBorder);
      expect(setGraphActive).toHaveBeenCalledWith(true);
    }
  });
});
