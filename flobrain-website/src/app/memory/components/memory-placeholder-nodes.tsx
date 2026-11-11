"use client";

import type { MemoryNodeApi } from "@/lib/api";
import { categoryCssVar, type MemoryCategoryId } from "@/lib/memory-visual";
import type { memoryNode } from "@/types/MemoryNodes";

const API_MEMORY_TYPE: Record<MemoryCategoryId, string> = {
  chunks: "Chunks",
  summaries: "Summaries",
  interactions: "Interactions",
  workflows: "Workflows",
};

export const MEMORY_PLACEHOLDER_LAYOUT: {
  id: string;
  category: MemoryCategoryId;
  label: string;
  left: string;
  top: string;
  sizePx: number;
}[] = [
  { id: "placeholder-chunks", category: "chunks", label: "Memory chunk", left: "36%", top: "44%", sizePx: 16 },
  { id: "placeholder-summaries", category: "summaries", label: "Summary", left: "54%", top: "36%", sizePx: 20 },
  { id: "placeholder-interactions", category: "interactions", label: "User interaction", left: "42%", top: "58%", sizePx: 20 },
  { id: "placeholder-workflows", category: "workflows", label: "Workflow output", left: "50%", top: "48%", sizePx: 26 },
];

/** API-shaped nodes for legend counts when the placeholder canvas is visible (one per on-screen sphere). */
export function placeholderNodesForLegend(): MemoryNodeApi[] {
  return MEMORY_PLACEHOLDER_LAYOUT.map((n) => ({
    id: n.id,
    name: n.label,
    val: n.sizePx,
    group: n.category,
    memory_type: API_MEMORY_TYPE[n.category],
  }));
}

type MemoryPlaceholderNodesProps = {
  onNodeClick: (node: memoryNode) => void;
};

export function MemoryPlaceholderNodes({ onNodeClick }: MemoryPlaceholderNodesProps) {
  return (
    <div className="absolute inset-0 z-[1]">
      {MEMORY_PLACEHOLDER_LAYOUT.map((n) => {
        const color = categoryCssVar(n.category);
        const half = n.sizePx / 2;
        return (
          <button
            key={n.id}
            type="button"
            aria-label={`Open details for ${n.label}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-0 bg-transparent p-0 outline-none transition-transform duration-200 hover:scale-110 focus-visible:ring-2 focus-visible:ring-[var(--fb-memory-btn-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fb-memory-canvas-bg)]"
            style={{ left: n.left, top: n.top, width: n.sizePx, height: n.sizePx }}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick({
                id: n.id,
                name: n.label,
                group: n.category,
                memory_type: API_MEMORY_TYPE[n.category],
                val: n.sizePx,
                created_at: new Date().toISOString(),
              });
            }}
          >
            <span
              className="block size-full rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.95), ${color} 42%, ${color} 100%)`,
                boxShadow: `0 0 ${half}px color-mix(in srgb, ${color} 67%, transparent), 0 0 ${half * 1.6}px color-mix(in srgb, ${color} 40%, transparent), inset 0 -2px 6px rgba(0,0,0,0.2)`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
