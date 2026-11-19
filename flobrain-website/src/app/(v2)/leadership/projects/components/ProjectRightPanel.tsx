"use client";

import { Play } from "lucide-react";

const buddyColors = [
  "#22c55e",
  "#22c55e",
  "#ef4444",
  "#f97316",
  "#22c55e",
  "#8b5cf6",
  "#3b82f6",
  "#14b8a6",
  "#ef4444",
];

export function ProjectRightPanel() {
  return (
    <div
      className="flex h-full min-h-[600px] flex-col gap-5 p-3"
      style={{ color: "var(--fb-v2-text)" }}
    >
      <section>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
          Flo-Timer
        </h2>

        <div
          className="flex items-center justify-between gap-2 rounded-md border px-3 py-4"
          style={{
            background: "var(--fb-v2-surface)",
            borderColor: "var(--fb-v2-border)",
          }}
        >
          <span className="text-[9px] tabular-nums">00:00:00</span>

          <div
            className="h-8 w-8 shrink-0 rounded-full border-[3px] border-t-transparent"
            style={{
              borderColor: "var(--fb-v2-accent)",
              borderTopColor: "transparent",
            }}
            aria-label="Timer indicator"
          />

          <Play size={17} fill="currentColor" aria-label="Start timer" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
          Buddies - AI Agents
        </h2>

        <p className="mb-4 text-center text-[10px]" style={{ color: "var(--fb-v2-text-muted)" }}>
          Tap a Buddy to route chat.
        </p>

        <div className="space-y-2">
          {buddyColors.map((color, index) => (
            <div
              key={index}
              className="h-8 rounded-md border"
              style={{
                borderColor: color,
                background: "var(--fb-v2-surface)",
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
