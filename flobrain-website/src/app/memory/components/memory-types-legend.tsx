"use client";

import { Database, FileText, MessageCircle, GitBranch } from "lucide-react";
import type { MemoryNodeApi } from "@/lib/api";
import {
  MEMORY_PALETTE,
  countNodesByCategory,
  type MemoryCategoryId,
} from "@/lib/memory-visual";

const ROWS: {
  id: MemoryCategoryId;
  title: string;
  subtitle: string;
  size: string;
  Icon: typeof Database;
}[] = [
  {
    id: "chunks",
    title: "Memory Chunks",
    subtitle: "Raw data",
    size: "Small",
    Icon: Database,
  },
  {
    id: "summaries",
    title: "Summaries",
    subtitle: "Condensed info",
    size: "Medium",
    Icon: FileText,
  },
  {
    id: "interactions",
    title: "User Interactions",
    subtitle: "Chat logs",
    size: "Medium",
    Icon: MessageCircle,
  },
  {
    id: "workflows",
    title: "Workflow Outputs",
    subtitle: "Automated results",
    size: "Large",
    Icon: GitBranch,
  },
];

export function MemoryTypesLegend({ nodes }: { nodes: MemoryNodeApi[] }) {
  const counts = countNodesByCategory(nodes);
  const total = nodes.length;

  return (
    <div
      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-[#7B5CFF]" aria-hidden />
        <h2 className="text-sm font-semibold text-[#2D1B4E]">Memory Types</h2>
      </div>
      <ul className="space-y-3">
        {ROWS.map(({ id, title, subtitle, size, Icon }) => {
          const color = MEMORY_PALETTE[id];
          const n = counts[id];
          return (
            <li key={id} className="flex items-start gap-3">
              <div
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                }}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[#2D1B4E]">{title}</div>
                <div className="text-xs text-[#7A6890]">{subtitle}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#7A6890]">
                  <span>Size: {size}</span>
                  <span className="text-[#7A6890]">·</span>
                  <span className="text-[#5C4A72]">{n.toLocaleString()} nodes</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="text-xs text-[#7A6890]">Total Memory Nodes</span>
        <span className="text-lg font-semibold tabular-nums text-[#2D1B4E]">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
