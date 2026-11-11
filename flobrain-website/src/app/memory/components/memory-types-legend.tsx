"use client";

import { useEffect, useState } from "react";
import { Database, FileText, MessageCircle, GitBranch } from "lucide-react";
import type { MemoryNodeApi } from "@/lib/api";
import {
  categoryCssVar,
  countNodesByCategory,
  type MemoryCategoryId,
} from "@/lib/memory-visual";
import { cn } from "@/lib/utils";

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

const MOBILE_PAGES = [ROWS.slice(0, 2), ROWS.slice(2, 4)] as const;
const CROSSFADE_MS = 750;
const ROTATE_INTERVAL_MS = 5200;
const CROSSFADE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

type RowDef = (typeof ROWS)[number];

function MobileTypeCell({
  id,
  title,
  Icon,
  nodeCount,
}: {
  id: MemoryCategoryId;
  title: string;
  Icon: RowDef["Icon"];
  nodeCount: number;
}) {
  const color = categoryCssVar(id);
  return (
    <div className="fb-memory-surface min-w-0 rounded-lg border p-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-md"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
          }}
        >
          <Icon className="size-3.5" strokeWidth={1.75} />
        </div>
        <p className="min-w-0 truncate text-[11px] font-medium leading-tight text-[var(--fb-memory-heading)]">{title}</p>
      </div>
      <p className="mt-1 truncate pl-[calc(1.75rem+0.375rem)] text-[10px] leading-tight text-[var(--fb-memory-text-muted)]">
        {nodeCount.toLocaleString()} nodes
      </p>
    </div>
  );
}

function MobileFlipTypes({
  counts,
}: {
  counts: Record<MemoryCategoryId, number>;
}) {
  const [page, setPage] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionEnabled(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!motionEnabled) return;

    const interval = window.setInterval(() => {
      setPage((p) => (p + 1) % MOBILE_PAGES.length);
    }, ROTATE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [motionEnabled]);

  if (!motionEnabled) {
    return (
      <div className="grid grid-cols-2 gap-2 lg:hidden">
        {MOBILE_PAGES[0].map((row) => (
          <MobileTypeCell
            key={row.id}
            id={row.id}
            title={row.title}
            Icon={row.Icon}
            nodeCount={counts[row.id]}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="lg:hidden">
      <div
        className="relative h-[54px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {MOBILE_PAGES.map((rows, pageIndex) => {
          const isActive = pageIndex === page;
          return (
            <div
              key={pageIndex}
              className={cn(
                "absolute inset-0 grid grid-cols-2 gap-2 motion-reduce:transition-none",
                isActive ? "z-10 opacity-100" : "z-0 opacity-0"
              )}
              style={{
                transitionProperty: "opacity",
                transitionDuration: `${CROSSFADE_MS}ms`,
                transitionTimingFunction: CROSSFADE_EASING,
                pointerEvents: isActive ? "auto" : "none",
              }}
              aria-hidden={!isActive}
            >
              {rows.map((row) => (
                <MobileTypeCell
                  key={row.id}
                  id={row.id}
                  title={row.title}
                  Icon={row.Icon}
                  nodeCount={counts[row.id]}
                />
              ))}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-center gap-1.5" aria-hidden>
        {MOBILE_PAGES.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all motion-reduce:transition-none",
              i === page ? "w-3 bg-[var(--fb-memory-accent)]" : "w-1 bg-[var(--fb-memory-track)]"
            )}
            style={{
              transitionDuration: `${CROSSFADE_MS}ms`,
              transitionTimingFunction: CROSSFADE_EASING,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function MemoryTypesLegend({ nodes }: { nodes: MemoryNodeApi[] }) {
  const counts = countNodesByCategory(nodes);
  const total = nodes.length;

  return (
    <div
      className="fb-memory-surface rounded-xl border p-2.5 max-lg:backdrop-blur-none lg:rounded-2xl lg:p-4 lg:backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between gap-2 lg:mb-3 lg:justify-start">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--fb-memory-accent)]" aria-hidden />
          <h2 className="text-xs font-semibold text-[var(--fb-memory-heading)] lg:text-sm">Memory Types</h2>
        </div>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[var(--fb-memory-heading)] lg:hidden">
          {total.toLocaleString()} total
        </span>
      </div>

      <MobileFlipTypes counts={counts} />

      <ul className="hidden lg:grid lg:grid-cols-1 lg:gap-0 lg:space-y-3">
        {ROWS.map(({ id, title, subtitle, size, Icon }) => {
          const color = categoryCssVar(id);
          const n = counts[id];
          return (
            <li key={id} className="flex items-start gap-3">
              <div
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                  color,
                }}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[var(--fb-memory-heading)]">{title}</div>
                <div className="text-xs text-[var(--fb-memory-text-subtle)]">{subtitle}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--fb-memory-text-subtle)]">
                  <span>Size: {size}</span>
                  <span className="text-[var(--fb-memory-text-faint)]">·</span>
                  <span className="text-[var(--fb-memory-text-muted)]">{n.toLocaleString()} nodes</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 hidden items-center justify-between border-t border-[var(--fb-memory-header-border)] pt-3 lg:flex">
        <span className="text-xs text-[var(--fb-memory-text-subtle)]">Total Memory Nodes</span>
        <span className="text-lg font-semibold tabular-nums text-[var(--fb-memory-heading)]">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
