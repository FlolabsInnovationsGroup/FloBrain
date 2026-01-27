import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryGraph } from "./index";

vi.mock('../mockData', () => ({
    memoryNodes: [
        { id: '1', name: 'Node A', group: 1 },
        { id: '2', name: 'Node B', group: 2 }
    ],
    memoryLinks: [
        { source: '1', target: '2' }
    ]
}));

vi.mock("react-force-graph-2d", () => ({
    default: (props: any) => {
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
        render(<MemoryGraph onOpenMemoryNodeDialog={onOpenDialog} />);
        expect(screen.getByTestId("force-graph-mock")).toBeDefined();
    });

    it("should pass the correct data to the graph", () => {
        const onOpenDialog = vi.fn();
        render(<MemoryGraph onOpenMemoryNodeDialog={onOpenDialog} />);
        expect(screen.getByTestId("node-count").textContent).toBe("2");
    });

    it("should call onOpenMemoryNodeDialog when a node is clicked", () => {
        const onOpenDialog = vi.fn();
        render(<MemoryGraph onOpenMemoryNodeDialog={onOpenDialog} />);

        const simulateButton = screen.getByTestId("simulate-node-click");
        fireEvent.click(simulateButton);

        expect(onOpenDialog).toHaveBeenCalledTimes(1);
        expect(onOpenDialog).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            name: 'Node A'
        }));
    });

    it("should handle window resize events", () => {
        const onOpenDialog = vi.fn();
        render(<MemoryGraph onOpenMemoryNodeDialog={onOpenDialog} />);

        act(() => {
            global.innerWidth = 500;
            global.dispatchEvent(new Event('resize'));
        });

        expect(screen.getByTestId("force-graph-mock")).toBeDefined();
    });
});
