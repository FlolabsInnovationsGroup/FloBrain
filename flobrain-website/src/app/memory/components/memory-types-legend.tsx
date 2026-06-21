"use client";

import { useEffect, useState } from "react";
import { Database, FileText, MessageCircle, GitBranch } from "lucide-react";
import type { MemoryNodeApi } from "@/lib/api";
import {
  MEMORY_PALETTE,
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
  const color = MEMORY_PALETTE[id];
  return (
    <div className="min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-md"
          style={{
            backgroundColor: `${color}18`,
            color,
          }}
        >
          <Icon className="size-3.5" strokeWidth={1.75} />
        </div>
        <p className="min-w-0 truncate text-[11px] font-medium leading-tight text-white">{title}</p>
      </div>
      <p className="mt-1 truncate pl-[calc(1.75rem+0.375rem)] text-[10px] leading-tight text-zinc-400">
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
              i === page ? "w-3 bg-[#7B5CFF]" : "w-1 bg-white/20"
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
      className="rounded-xl border border-white/[0.08] bg-[#0c0614]/92 p-2.5 max-lg:backdrop-blur-none lg:rounded-2xl lg:bg-white/[0.03] lg:p-4 lg:backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
<<<<<<< HEAD
      <div className="mb-3 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-[#7B5CFF]" aria-hidden />
        <h2 className="text-sm font-semibold text-[#2D1B4E]">Memory Types</h2>
=======
      <div className="mb-2 flex items-center justify-between gap-2 lg:mb-3 lg:justify-start">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#7B5CFF]" aria-hidden />
          <h2 className="text-xs font-semibold text-white lg:text-sm">Memory Types</h2>
        </div>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-white lg:hidden">
          {total.toLocaleString()} total
        </span>
>>>>>>> origin/main
      </div>

      <MobileFlipTypes counts={counts} />

      <ul className="hidden lg:grid lg:grid-cols-1 lg:gap-0 lg:space-y-3">
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
<<<<<<< HEAD
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="text-xs text-[#7A6890]">Total Memory Nodes</span>
        <span className="text-lg font-semibold tabular-nums text-[#2D1B4E]">{total.toLocaleString()}</span>
=======

      <div className="mt-3 hidden items-center justify-between border-t border-white/[0.06] pt-3 lg:flex">
        <span className="text-xs text-zinc-500">Total Memory Nodes</span>
        <span className="text-lg font-semibold tabular-nums text-white">{total.toLocaleString()}</span>
>>>>>>> origin/main
      </div>
    </div>
  );
}
