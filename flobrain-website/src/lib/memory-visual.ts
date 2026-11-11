import type { MemoryNodeApi } from "@/lib/api";

export type MemoryCategoryId = "chunks" | "summaries" | "interactions" | "workflows";

/** Dark-mode graph / legend colors (existing design). */
export const MEMORY_PALETTE = {
  chunks: "#56CCF2",
  summaries: "#7B5CFF",
  interactions: "#6FCF97",
  workflows: "#F2994A",
} as const;

/** Cases Light — Memory section. */
export const MEMORY_PALETTE_LIGHT = {
  chunks: "#60A5FA",
  summaries: "#A78BFA",
  interactions: "#34D399",
  workflows: "#FBBF24",
} as const;

export const MEMORY_CATEGORY_CSS_VARS: Record<MemoryCategoryId, `--fb-memory-${MemoryCategoryId}`> = {
  chunks: "--fb-memory-chunks",
  summaries: "--fb-memory-summaries",
  interactions: "--fb-memory-interactions",
  workflows: "--fb-memory-workflows",
};

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

export function memoryPaletteForTheme(theme?: string | null) {
  return theme === "light" ? MEMORY_PALETTE_LIGHT : MEMORY_PALETTE;
}

export function categoryColor(category: MemoryCategoryId, theme?: string | null): string {
  return memoryPaletteForTheme(theme)[category];
}

export function categoryCssVar(category: MemoryCategoryId): string {
  return `var(${MEMORY_CATEGORY_CSS_VARS[category]})`;
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
