"use client";

import React, { memo } from "react";
import { Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Future-ready: when API exists, pass this shape for real data */
export interface InteractionEntry {
  id?: string;
  question: string;
  timestamp: string;
  tokens: number;
  model: "GPT-4o" | "Claude" | "Gemini";
}

export interface RecentInteractionsAnalytics {
  today: number;
  thisWeek: number;
}

const MODEL_TAG_STYLES: Record<
  InteractionEntry["model"],
  string
> = {
  "GPT-4o": "bg-[#00D492]/10 border border-[#00D492]/20 text-[#00D492] font-light text-xs",
  Claude: "bg-[#FF8904]/10 border border-[#FF8904]/20 text-[#FF8904] font-light text-xs",
  Gemini: "bg-[#51A2FF]/10 border border-[#51A2FF]/20 text-[#51A2FF] font-light text-xs",
};

const MOCK_INTERACTIONS: InteractionEntry[] = [
  {
    question: "How can I optimize the database queries",
    timestamp: "2 minutes ago",
    tokens: 342,
    model: "GPT-4o",
  },
  {
    question: "Explain the difference between REST and GraphQL",
    timestamp: "8 minutes ago",
    tokens: 578,
    model: "Claude",
  },
  {
    question: "Write a Python function for data validation",
    timestamp: "14 minutes ago",
    tokens: 421,
    model: "Gemini",
  },
  {
    question: "What are the best practices for API security",
    timestamp: "23 minutes ago",
    tokens: 689,
    model: "GPT-4o",
  },
  {
    question: "Debug the authentication middleware error",
    timestamp: "35 minutes ago",
    tokens: 512,
    model: "Claude",
  },
];

const MOCK_ANALYTICS: RecentInteractionsAnalytics = {
  today: 24,
  thisWeek: 847,
};

const ChatHistoryCard = memo(function ChatHistoryCard({
  question,
  timestamp,
  tokens,
  model,
}: InteractionEntry) {
  return (
    <div
      className="rounded-xl border border-white/5 bg-[#1E293B]/75 light:border-[var(--fb-panel-border)] light:bg-[var(--fb-panel-bg)] p-4 transition-colors hover:border-white/10 light:hover:border-[#a78bfa]/60"
      role="listitem"
    >
      <p className="text-sm text-white light:text-[var(--fb-text)] leading-snug line-clamp-2 mb-3">
        {question}
      </p>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 light:text-[var(--fb-text-muted)]">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {timestamp}
        </span>
        <span className="text-[11px] text-slate-400 light:text-[var(--fb-text-muted)]">{tokens} tokens</span>
      </div>
      <div className="mt-2 text-right">
        <span
          className={cn(
            "inline-block rounded-md px-2 py-1 text-[10px] font-medium",
            MODEL_TAG_STYLES[model]
          )}
        >
          {model}
        </span>
      </div>
    </div>
  );
});

const AnalyticsSummaryCard = memo(function AnalyticsSummaryCard({
  value,
  label,
  variant = "purple",
}: {
  value: number;
  label: string;
  variant?: "purple" | "green";
}) {
  return (
    <div
      className="rounded-xl border border-white/5 bg-[#1E293B]/75 light:border-[var(--fb-panel-border)] light:bg-[var(--fb-panel-bg)] p-5"
      role="status"
      aria-label={`${label}: ${value}`}
    >
      <p
        className={cn(
          "text-2xl font-bold tabular-nums",
          variant === "purple" ? "text-[#A855F7]" : "text-[#00D492]"
        )}
      >
        {value}
      </p>
      <p className="text-xs text-white light:text-[var(--fb-text)] font-medium mt-1">{label}</p>
    </div>
  );
});

export interface RecentInteractionsProps {
  /** When provided, overrides mock data (future API) */
  interactions?: InteractionEntry[];
  /** When provided, overrides mock analytics (future API) */
  analytics?: RecentInteractionsAnalytics;
}

const RecentInteractions = memo(function RecentInteractions({
  interactions = MOCK_INTERACTIONS,
  analytics = MOCK_ANALYTICS,
}: RecentInteractionsProps) {
  return (
    <div className="flex flex-col min-h-0 h-full">
      <header className="shrink-0 mb-4">
        <h3 className="text-lg font-bold text-white light:text-[var(--fb-heading)] flex items-center gap-2">
          <Sparkles
            size={20}
            className="text-purple-400/80 shrink-0"
            aria-hidden
          />
          Recent Interactions
        </h3>
        <p className="text-xs text-slate-400 light:text-[var(--fb-text-muted)] mt-1">Chat history and analytics</p>
      </header>

      <div
        className="flex-1 min-h-0 no-scrollbar overflow-y-auto"
        role="region"
        aria-label="Recent chat history"
      >
        <div className="space-y-3" role="list">
          {interactions.map((entry, index) => (
            <ChatHistoryCard
              key={entry.id ?? index}
              question={entry.question}
              timestamp={entry.timestamp}
              tokens={entry.tokens}
              model={entry.model}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 shrink-0 pt-4 mt-4 border-t border-white/5 light:border-[#1a1b25]/12">
        <AnalyticsSummaryCard
          value={analytics.today}
          label="Today"
          variant="purple"
        />
        <AnalyticsSummaryCard
          value={analytics.thisWeek}
          label="This Week"
          variant="green"
        />
      </div>
    </div>
  );
});

export { RecentInteractions };
