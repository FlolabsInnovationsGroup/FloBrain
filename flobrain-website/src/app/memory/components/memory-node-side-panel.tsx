"use client";

import { useEffect, useMemo } from "react";
import { Calendar, EyeOff, Pencil, Target, Trash2, X } from "lucide-react";
import type { MemoryNodeApi } from "@/lib/api";
import {
  MEMORY_PALETTE,
  nodeToCategory,
  type MemoryCategoryId,
} from "@/lib/memory-visual";
import type { memoryNode } from "@/types/MemoryNodes";

type MemoryNodeSidePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node?: memoryNode | null;
};

/** Panel copy per category (aligned with design); swap for API-driven labels later. */
const PANEL_TYPE_LABEL: Record<MemoryCategoryId, string> = {
  chunks: "Memory Chunk",
  summaries: "Summary",
  interactions: "User Interaction",
  workflows: "Workflow Output",
};

const MOCK_RAW_TEXT = "Automated result: Generated code snippet for user request";
const MOCK_CONNECTED = ["Node #7117", "Node #6603", "Node #104", "Node #8245", "Node #21"];
const MOCK_LINK_COUNT = 9;
const MOCK_RELEVANCE_PERCENT = 39;
const MOCK_RELEVANCE_TIER = "Low" as const;

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Relative calendar-day label for the Created row (no extra dependencies). */
function formatCreatedRelative(iso?: string | null): string {
  if (!iso) return "Today";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Today";
  const diffDays = Math.round(
    (startOfLocalDay(new Date()) - startOfLocalDay(parsed)) / 86_400_000
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

/** Stable short numeric id for titles/footer (graph ids are often opaque strings). */
function displayNodeNumber(id: string | number | undefined): string {
  if (id == null) return "—";
  const s = String(id);
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 3) return digits.slice(-4).replace(/^0+/, "") || digits.slice(-4);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i);
  const n = (Math.abs(h) % 9000) + 100;
  return String(n);
}

export function MemoryNodeSidePanel({ open, onOpenChange, node }: MemoryNodeSidePanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const derived = useMemo(() => {
    if (!node) return null;
    const apiShaped = node as MemoryNodeApi;
    const category = nodeToCategory(apiShaped);
    const color = MEMORY_PALETTE[category];
    const typeLabel = PANEL_TYPE_LABEL[category];
    const createdLabel = formatCreatedRelative(
      typeof node.created_at === "string" ? node.created_at : null
    );
    const displayId = displayNodeNumber(node.id);
    return { category, color, typeLabel, createdLabel, displayId };
  }, [node]);

  return (
    <>
      <div
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 z-[110] bg-black/50 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Memory node details"
        className={`fixed right-0 top-0 z-[120] flex h-[100dvh] w-[min(100vw,380px)] flex-col border-l border-white/[0.08] bg-[#0B0812]/98 shadow-[-12px_0_48px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                {derived ? `Memory Node #${derived.displayId}` : "Memory Node"}
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">Detailed information &amp; actions</p>
            </div>
            <button
              type="button"
              aria-label="Close panel"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl self-center border border-white/[0.12] text-zinc-400 transition hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div
          key={String(node?.id ?? "none")}
          className="memory-node-panel-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5"
        >
          {!derived ? (
            <p className="text-sm text-zinc-500">Select a memory node to see details.</p>
          ) : (
            <div className="flex min-h-full flex-col">
              <section className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Type</p>
                <span
                  className="inline-flex rounded-lg border px-3 py-1.5 text-sm font-medium"
                  style={{
                    color: derived.color,
                    borderColor: `${derived.color}55`,
                    backgroundColor: `${derived.color}14`,
                  }}
                >
                  {derived.typeLabel}
                </span>
              </section>

              <section className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Created</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{derived.createdLabel}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Target className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Relevance</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">
                    <span className="text-white">{MOCK_RELEVANCE_PERCENT}%</span>{" "}
                    <span className="text-rose-300/90">{MOCK_RELEVANCE_TIER}</span>
                  </p>
                </div>
              </section>

              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800"
                role="presentation"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-[#E85D5D]"
                  style={{ width: `${MOCK_RELEVANCE_PERCENT}%` }}
                />
              </div>

              <section className="mt-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Raw Text
                  </span>
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-[#7B5CFF]"
                    aria-hidden
                  />
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#06040c] px-3.5 py-3 text-sm leading-relaxed text-zinc-500">
                  {MOCK_RAW_TEXT}
                </div>
              </section>

              <section className="mt-8 space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-medium text-white">Connected Nodes</h3>
                  <span className="text-xs text-zinc-500">{MOCK_LINK_COUNT} links</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOCK_CONNECTED.map((label) => (
                    <span
                      key={label}
                      className="rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-400"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </section>

              <section className="mt-8 space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Actions</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                  >
                    <Pencil className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    Edit Context
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                  >
                    <EyeOff className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    Exclude from Future
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-950/35 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-950/50"
                  >
                    <Trash2 className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    Delete Node
                  </button>
                </div>
              </section>

              <footer className="mt-auto border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Node ID:</span>
                  <span className="tabular-nums text-zinc-400">#{derived.displayId}</span>
                </div>
              </footer>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
