import type { MemoryNodeApi } from "@/lib/api";

export type MemoryCategoryId = "chunks" | "summaries" | "interactions" | "workflows";

export const MEMORY_PALETTE = {
  chunks: "#56CCF2",
  summaries: "#7B5CFF",
  interactions: "#6FCF97",
  workflows: "#F2994A",
} as const;

const API_TO_CATEGORY: Record<string, MemoryCategoryId> = {
  Chunks: "chunks",
  Summaries: "summaries",
  Interactions: "interactions",
  Workflows: "workflows",
};

/** API filter value → category for coloring / legend */
export function nodeToCategory(node: MemoryNodeApi): MemoryCategoryId {
  const explicit = node.memory_type?.trim();
  if (explicit && API_TO_CATEGORY[explicit]) {
    return API_TO_CATEGORY[explicit];
  }
  const g = (node.group || "").toLowerCase();
  const m = (node.memory_type || "").toLowerCase();
  const hay = `${g} ${m}`;
  if (hay.includes("chunk")) return "chunks";
  if (hay.includes("summar")) return "summaries";
  if (hay.includes("interact") || hay.includes("chat") || hay.includes("user")) return "interactions";
  if (hay.includes("workflow")) return "workflows";
  return "chunks";
}

export function categoryColor(category: MemoryCategoryId): string {
  return MEMORY_PALETTE[category];
}

export function countNodesByCategory(nodes: MemoryNodeApi[]): Record<MemoryCategoryId, number> {
  const counts: Record<MemoryCategoryId, number> = {
    chunks: 0,
    summaries: 0,
    interactions: 0,
    workflows: 0,
  };
  for (const n of nodes) {
    counts[nodeToCategory(n)] += 1;
  }
  return counts;
}
