"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { ForceGraphMethods } from "react-force-graph-2d";
import type { MemoryNodeApi } from "@/lib/api";
import { memoryNode } from "@/types/MemoryNodes";
import { memoryPaletteForTheme, nodeToCategory } from "@/lib/memory-visual";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface MemoryGraphProps {
  nodes: MemoryNodeApi[];
  links: { source: string; target: string }[];
  onOpenMemoryNodeDialog: (node: memoryNode) => void;
  graphActive: boolean;
  setGraphActive: (active: boolean) => void;
}

function toGraphNodes(apiNodes: MemoryNodeApi[]): memoryNode[] {
  return apiNodes.map((n) => ({
    id: n.id,
    name: n.name,
    val: n.val,
    group: n.group,
    memory_type: n.memory_type,
    relevance: n.relevance,
    created_at: n.created_at,
  }));
}

function toGraphLinks(links: { source: string; target: string }[]) {
  return links.map((l) => ({ source: l.source, target: l.target }));
}

export const MemoryGraph = ({
  nodes,
  links,
  onOpenMemoryNodeDialog,
  graphActive,
  setGraphActive,
}: MemoryGraphProps) => {
  const { resolvedTheme } = useTheme();
  const palette = memoryPaletteForTheme(resolvedTheme);
  const linkColor = resolvedTheme === "light" ? "#610081" : "#ffffff";

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods<memoryNode, { source: string; target: string }> | undefined>(
    undefined
  );

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Keep graph data references stable unless API data actually changes.
  // This prevents force-graph from resetting node positions on local UI state changes.
  const graphNodes = useMemo(
    () =>
      toGraphNodes(nodes).map((n) => ({
        ...n,
        color: palette[nodeToCategory(n as MemoryNodeApi)],
      })),
    [nodes, palette]
  );
  const graphLinks = useMemo(() => toGraphLinks(links), [links]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        setDimensions((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
      }
    };

    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(el);
    window.addEventListener("resize", updateDimensions);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && graphActive) {
      setGraphActive(false);
    }
  };

  const handleBorderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!graphActive) {
      setGraphActive(true);
    }
  };

  const handleResetView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    graphRef.current?.centerAt?.(0, 0, 350);
    graphRef.current?.zoomToFit?.(500, 60);
  };

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col" onClick={handleOutsideClick}>
      <div className="fb-memory-hint pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-lg border px-4 py-2 text-sm">
        {graphActive
          ? "Click outside the graph to navigate the memory page"
          : "Click inside the border to interact with the graph"}
      </div>
      <button
        type="button"
        onClick={handleResetView}
        className="fb-memory-hint absolute right-3 top-2 z-10 rounded-md border px-2.5 py-1 text-xs transition hover:opacity-80"
        aria-label="Reset graph view"
      >
        Reset view
      </button>

      <div
        className={`mt-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border-4 transition-all duration-300 ${
          graphActive ? "shadow-lg" : ""
        }`}
        style={{
          borderColor: graphActive
            ? "var(--fb-memory-graph-border-active)"
            : "var(--fb-memory-graph-border)",
          boxShadow: graphActive ? "0 10px 24px color-mix(in srgb, var(--fb-memory-graph-border-active) 35%, transparent)" : undefined,
        }}
        onClick={handleBorderClick}
      >
        <div
          ref={containerRef}
          className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg bg-transparent"
          style={{ pointerEvents: graphActive ? "auto" : "none" }}
        >
          {dimensions.width > 0 && dimensions.height > 0 && (
            <ForceGraph2D
              ref={graphRef}
              graphData={{ nodes: graphNodes, links: graphLinks }}
              width={dimensions.width}
              height={dimensions.height}
              nodeAutoColorBy="group"
              nodeLabel="name"
              onNodeClick={(node) => {
                if (graphActive) {
                  onOpenMemoryNodeDialog(node as memoryNode);
                }
              }}
              nodeCanvasObject={(node: memoryNode, ctx, globalScale) => {
                const name = typeof node.name === "string" ? node.name : "";
                const label = name.length > 10 ? `${name.slice(0, 10)}...` : name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = node.color;
                ctx.fillText(label, node.x ?? 0, node.y ?? 0);
                node.__bckgDimensions = bckgDimensions;
              }}
              nodePointerAreaPaint={(node: memoryNode, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions = node.__bckgDimensions;
                const nodeX = node.x ?? 0;
                const nodeY = node.y ?? 0;

                if (bckgDimensions) {
                  ctx.fillRect(
                    nodeX - bckgDimensions[0] / 2,
                    nodeY - bckgDimensions[1] / 2,
                    bckgDimensions[0],
                    bckgDimensions[1]
                  );
                }
              }}
              linkColor={() => linkColor}
              backgroundColor="rgba(0,0,0,0)"
              enableNodeDrag={graphActive}
              enableZoomInteraction={graphActive}
              enablePanInteraction={graphActive}
            />
          )}
        </div>
      </div>
    </div>
  );
};
