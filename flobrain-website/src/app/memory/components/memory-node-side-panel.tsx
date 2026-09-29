"use client";

import { useEffect, useMemo } from "react";
import { Calendar, EyeOff, Pencil, Target, Trash2, X } from "lucide-react";
import type { MemoryNodeApi } from "@/lib/api";
import { api } from "@/lib/api";
import { useQuery } from "@/hooks/useApi";
import {
  categoryCssVar,
  nodeToCategory,
  type MemoryCategoryId,
} from "@/lib/memory-visual";
import type { memoryNode } from "@/types/MemoryNodes";
import { cn } from "@/lib/utils";

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

function getRelevanceTier(pct: number) {
  if (pct >= 70) {
    return {
      label: "High",
      textColor: "text-[var(--fb-memory-success)]",
      barColor: "var(--fb-memory-success)",
    };
  }
  if (pct >= 40) {
    return {
      label: "Medium",
      textColor: "text-[var(--fb-memory-workflows)]",
      barColor: "var(--fb-memory-workflows)",
    };
  }
  return {
    label: "Low",
    textColor: "text-[var(--fb-memory-error)]",
    barColor: "var(--fb-memory-error)",
  };
}

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

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const nodeId = node?.id != null ? String(node.id) : null;
  // Placeholder nodes are pure UI visuals with fake IDs — never call the API for them
  const isPlaceholder = nodeId?.startsWith("placeholder-") ?? false;

  const { data: nodeDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["memory", "node", nodeId],
    queryFn: async () => {
      if (!nodeId) throw new Error("No node id");
      const result = await api.getMemoryNode(nodeId);
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Failed to load node detail");
      }
      return result.data!;
    },
    enabled: open && !!nodeId && !isPlaceholder,
    staleTime: 30_000,
  });

  const rawRelevance: number =
    nodeDetail?.relevance ?? (node?.relevance as number | undefined) ?? 0;
  const relevancePercent = Math.round(rawRelevance * 100);
  const relevanceTier = getRelevanceTier(relevancePercent);

  const rawText: string =
    nodeDetail?.name ?? (node?.name as string | undefined) ?? "";

  const allConnections = [
    ...(nodeDetail?.connections.outgoing ?? []),
    ...(nodeDetail?.connections.incoming ?? []),
  ];
  const linkCount = nodeDetail?.connections.total ?? 0;

  const derived = useMemo(() => {
    if (!node) return null;
    const apiShaped = node as MemoryNodeApi;
    const category = nodeToCategory(apiShaped);
    const color = categoryCssVar(category);
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
        className={`fixed inset-0 z-[110] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ background: "var(--fb-memory-overlay)" }}
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Memory node details"
        className={cn(
          "fb-memory-panel fixed z-[120] flex flex-col border transition-transform duration-300 ease-out motion-reduce:transition-none",
          "max-lg:inset-0 max-lg:h-[100dvh] max-lg:w-full max-lg:backdrop-blur-none",
          open ? "max-lg:translate-y-0" : "max-lg:translate-y-full",
          "lg:inset-y-0 lg:right-0 lg:left-auto lg:top-0 lg:h-[100dvh] lg:max-h-none lg:w-[min(100vw,380px)] lg:max-w-[380px] lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-[-12px_0_48px_rgba(97,0,129,0.18)] lg:backdrop-blur-xl",
          open ? "lg:translate-x-0 lg:translate-y-0" : "lg:translate-x-full lg:translate-y-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-[var(--fb-memory-header-border)] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pb-3 md:px-5 md:py-4 md:pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-[var(--fb-memory-heading)] sm:text-base md:text-lg">
                {derived ? `Memory Node #${derived.displayId}` : "Memory Node"}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fb-memory-text-subtle)] sm:text-sm">Detailed information &amp; actions</p>
            </div>
            <button
              type="button"
              aria-label="Close panel"
              className="flex size-8 shrink-0 items-center justify-center self-center rounded-lg border border-[var(--fb-memory-surface-border)] text-[var(--fb-memory-text-muted)] transition hover:bg-[var(--fb-memory-surface-bg)] hover:text-[var(--fb-memory-heading)] sm:size-9 sm:rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div
          key={String(node?.id ?? "none")}
          className="memory-node-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4 md:px-5 md:py-5"
        >
          {!derived ? (
            <p className="text-sm text-[var(--fb-memory-text-subtle)]">Select a memory node to see details.</p>
          ) : (
            <div className="flex min-h-full flex-col">
              <section className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fb-memory-text-subtle)]">Type</p>
                <span
                  className="inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium sm:px-3 sm:py-1.5 sm:text-sm"
                  style={{
                    color: derived.color,
                    borderColor: `color-mix(in srgb, ${derived.color} 40%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${derived.color} 14%, transparent)`,
                  }}
                >
                  {derived.typeLabel}
                </span>
              </section>

              <section className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
                <div
                  className="rounded-lg border px-2.5 py-2.5 sm:rounded-xl sm:px-3 sm:py-3"
                  style={{
                    background: "var(--fb-memory-meta-created-bg)",
                    borderColor: "var(--fb-memory-surface-border)",
                    color: "var(--fb-memory-meta-created-text)",
                  }}
                >
                  <div className="flex items-center gap-2 opacity-80">
                    <Calendar className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Created</span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold sm:mt-2 sm:text-sm">{derived.createdLabel}</p>
                </div>
                <div className="fb-memory-surface rounded-lg border px-2.5 py-2.5 sm:rounded-xl sm:px-3 sm:py-3">
                  <div className="flex items-center gap-2 text-[var(--fb-memory-text-subtle)]">
                    <Target className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Relevance</span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold sm:mt-2 sm:text-sm">
                    <span className="text-[var(--fb-memory-heading)]">
                      {detailLoading ? "—" : `${relevancePercent}%`}
                    </span>{" "}
                    <span className={relevanceTier.textColor}>
                      {detailLoading ? "" : relevanceTier.label}
                    </span>
                  </p>
                </div>
              </section>

              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--fb-memory-track)]"
                role="presentation"
                aria-hidden
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: detailLoading ? "0%" : `${relevancePercent}%`,
                    backgroundColor: relevanceTier.barColor,
                  }}
                />
              </div>

              <section className="mt-5 space-y-2 sm:mt-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--fb-memory-text-subtle)] sm:text-[11px]">
                    Raw Text
                  </span>
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-[var(--fb-memory-accent)]"
                    aria-hidden
                  />
                </div>
                <div
                  className="rounded-xl border px-3.5 py-3 text-sm leading-relaxed text-[var(--fb-memory-text-muted)]"
                  style={{
                    borderColor: "var(--fb-memory-surface-border)",
                    background: "var(--fb-memory-raw-bg)",
                  }}
                >
                  {rawText || <span className="italic opacity-60">No content</span>}
                </div>
              </section>

              <section className="mt-5 space-y-2.5 sm:mt-8 sm:space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xs font-medium text-[var(--fb-memory-heading)] sm:text-sm">Connected Nodes</h3>
                  <span className="text-[10px] text-[var(--fb-memory-text-subtle)] sm:text-xs">
                    {detailLoading ? "—" : `${linkCount} links`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {detailLoading && (
                    <span className="animate-pulse text-[10px] text-[var(--fb-memory-text-subtle)] sm:text-xs">
                      Loading connections…
                    </span>
                  )}
                  {!detailLoading && allConnections.length === 0 && (
                    <span className="text-[10px] text-[var(--fb-memory-text-faint)] sm:text-xs">No connections</span>
                  )}
                  {!detailLoading && allConnections.map((c) => {
                    const label = c.name && c.name.length <= 22
                      ? c.name
                      : c.name
                      ? `${c.name.slice(0, 22)}…`
                      : `Node #${displayNodeNumber(c.id)}`;
                    return (
                      <span
                        key={`${c.id}-${label}`}
                        className="fb-memory-chip rounded-md border px-2 py-0.5 text-[10px] sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5 space-y-2 sm:mt-8">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--fb-memory-text-subtle)] sm:text-[11px]">Actions</p>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-white transition hover:opacity-90 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                    style={{ background: "var(--fb-memory-btn)", color: "#ffffff" }}
                  >
                    <Pencil className="size-3.5 shrink-0 sm:size-4" strokeWidth={1.75} aria-hidden />
                    Edit Context
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--fb-memory-surface-border)] bg-[var(--fb-memory-surface-bg)] px-3 py-2.5 text-xs font-medium text-[var(--fb-memory-heading)] transition hover:bg-[var(--fb-memory-btn-soft)] sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                  >
                    <EyeOff className="size-3.5 shrink-0 sm:size-4" strokeWidth={1.75} aria-hidden />
                    Exclude from Future
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                    style={{
                      background: "var(--fb-memory-danger-btn-bg)",
                      borderColor: "var(--fb-memory-danger-btn-border)",
                      color: "var(--fb-memory-danger-btn-text)",
                    }}
                  >
                    <Trash2 className="size-3.5 shrink-0 sm:size-4" strokeWidth={1.75} aria-hidden />
                    Delete Node
                  </button>
                </div>
              </section>

              <footer className="mt-auto border-t border-[var(--fb-memory-header-border)] pt-3 sm:pt-4">
                <div className="flex items-center justify-between text-[10px] text-[var(--fb-memory-text-subtle)] sm:text-xs">
                  <span>Node ID:</span>
                  <span className="tabular-nums text-[var(--fb-memory-text-muted)]">#{derived.displayId}</span>
                </div>
              </footer>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
