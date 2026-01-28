import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryGraph } from "./index";

// Mock the data
vi.mock('../../mockData', () => ({
  memoryNodes: [
    { id: '1', name: 'Node A', group: 1 },
    { id: '2', name: 'Node B', group: 2 }
  ],
  memoryLinks: [
    { source: '1', target: '2' }
  ]
}));

// Mock next/dynamic to return the mock component directly
vi.mock("next/dynamic", () => ({
  default: (_fn: any) => {
    // Return a mock component that simulates ForceGraph2D
    return (props: any) => {
      return (
        <div data-testid="force-graph-mock">
          <button
            data-testid="simulate-node-click"
            onClick={() => {
              if (props.onNodeClick) {
                props.onNodeClick({ id: '1', name: 'Node A' });
              }
            }}
          >
            Simulate Click
          </button>
          <span data-testid="node-count">{props.graphData.nodes.length}</span>
        </div>
      );
    };
  }
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
    expect(onOpenDialog).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      name: 'Node A'
    }));
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
      global.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId("force-graph-mock")).toBeDefined();
  });

  it("should display correct message when graph is inactive", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    const { container } = render(
      <MemoryGraph 
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={false}
        setGraphActive={setGraphActive}
      />
    );

    expect(container.textContent).toContain("Click inside the border to interact with the graph");
  });

  it("should display correct message when graph is active", () => {
    const onOpenDialog = vi.fn();
    const setGraphActive = vi.fn();
    const { container } = render(
      <MemoryGraph 
        onOpenMemoryNodeDialog={onOpenDialog}
        graphActive={true}
        setGraphActive={setGraphActive}
      />
    );

    expect(container.textContent).toContain("Click outside the graph to navigate the memory page");
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
