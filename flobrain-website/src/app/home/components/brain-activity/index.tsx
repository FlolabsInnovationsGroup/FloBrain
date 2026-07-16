"use client";

import React, { useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Coins,
  Target,
  Zap,
  CircleCheckBig,
  Loader2,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const METRIC_CARDS = [
  {
    icon: Clock,
    value: "142ms",
    label: "Latency",
    dotColor: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
    iconColor: "text-[#05DF72]"
  },
  {
    icon: Coins,
    value: "2,847",
    label: "Tokens Used",
    dotColor: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
    iconColor: "text-[#C27AFF]"
  },
  {
    icon: Target,
    value: "94.2%",
    label: "Confidence",
    dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
    iconColor: "text-[#51A2FF]"
  },
  {
    icon: Zap,
    value: "AI Core",
    label: "Active Model",
    dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
    iconColor: "text-[#FF8904]"
  },
] as const;

type ProcessStatus = "complete" | "processing" | "queued";

const PROCESSES = [
  {
    name: "Context Analysis",
    status: "complete" as ProcessStatus,
    progress: 100,
  },
  {
    name: "Model Inference",
    status: "processing" as ProcessStatus,
    progress: 64,
  },
  {
    name: "Response Generation",
    status: "processing" as ProcessStatus,
    progress: 42,
  },
  {
    name: "Quality Check",
    status: "queued" as ProcessStatus,
    progress: 15,
  },
];

const ProcessStatusBadge = memo(function ProcessStatusBadge({
  status,
}: {
  status: ProcessStatus;
}) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 font-extralight border border-emerald-500/30 px-3 py-1 text-[10px] font-light tracking-wider text-emerald-400">
        <CircleCheckBig className="h-3.5 w-3.5" />
        Complete
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 font-extralight border border-purple-500/30 px-3 py-1 text-[10px] font-light tracking-wider text-purple-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-600/30 font-extralight border border-slate-600/50 px-3 py-1 text-[10px] font-light tracking-wider text-slate-400">
      <Clock className="h-3.5 w-3.5" />
      Queued
    </span>
  );
});

const ProcessProgressBar = memo(function ProcessProgressBar({
  progress,
  status,
}: {
  progress: number;
  status: ProcessStatus;
}) {
  const gradient =
    status === "complete"
      ? "from-emerald-500 to-amber-500"
      : status === "processing"
        ? "from-blue-500 to-violet-500"
        : "from-slate-600 to-slate-500";

  return (
    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r transition-all duration-500",
          gradient
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

const MetricCard = memo(function MetricCard({
  icon: Icon,
  value,
  label,
  dotColor,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  dotColor: string;
  iconColor: string;
}) {
  return (
    <div
      role="listitem"
      className="relative rounded-xl border border-white/5 bg-[#1E293B]/80 p-4 py-8"
      aria-label={`${label}: ${value}`}
    >
      <div
        className={cn(
          "absolute top-5 right-4 w-2 h-2 rounded-full",
          dotColor
        )}
        aria-hidden="true"
      />
      <div className="ml-2">
        <div className="rounded-lg mb-4">
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-xs font-light mt-2 tracking-wider text-[#90A1B9]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
});

const ProcessRow = memo(function ProcessRow({
  name,
  status,
  progress,
}: {
  name: string;
  status: ProcessStatus;
  progress: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2 mb-3">
          <span className="text-base font-extralight text-white">{name}</span>
          <ProcessStatusBadge status={status} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 w-8 text-right">
            {progress}%
          </span>
        </div>
      </div>
      <ProcessProgressBar progress={progress} status={status} />
    </div>
  );
});

const PROCESS_SUMMARY = PROCESSES.reduce<Record<ProcessStatus, number>>(
  (acc, p) => {
    acc[p.status]++;
    return acc;
  },
  { complete: 0, processing: 0, queued: 0 }
);

function BrainActivityInner() {
  const askInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAskSubmit = useCallback(() => {
    const value = askInputRef.current?.value?.trim();
    if (!value) return;

    const query = new URLSearchParams({ initialMessage: value }).toString();
    router.push(`/brain?${query}`);
  }, [router]);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#767676]/38 font-[inter]">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-5 sm:px-4 lg:px-6">
        {/* Header */}
        <header className="my-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Brain Activity
          </h1>
          <p className="text-base text-[#90A1B9] my-4">
            Real-time orchestration of AI processes
          </p>
        </header>

        {/* Metric cards */}
        <div
          className="grid sm:grid-cols-4 gap-8 mb-8"
          role="list"
          aria-label="Key metrics"
        >
          {METRIC_CARDS.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>

        {/* Active Processes */}
        <div className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#181024]/95 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Active Processes
          </h2>
          <div className="space-y-6 ">
            {PROCESSES.map((item) => (
              <ProcessRow
                key={item.name}
                name={item.name}
                status={item.status}
                progress={item.progress}
              />
            ))}
            <div className="h-px bg-white/5" />
          </div>
          {/* Summary */}
          <div
            className="flex mx-20 pt-4 border-t border-white/5 justify-between"
            role="status"
            aria-label={`Process summary: ${PROCESS_SUMMARY.complete} completed, ${PROCESS_SUMMARY.processing} in progress, ${PROCESS_SUMMARY.queued} queued`}
          >
            <div>
              <p className="text-2xl font-semibold text-emerald-400 text-center">
                {PROCESS_SUMMARY.complete}
              </p>
              <p className="tracking-wider text-[#9CA3AF] font-light text-xs">
                Completed
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-blue-400 text-center">
                {PROCESS_SUMMARY.processing}
              </p>
              <p className="tracking-wider text-[#9CA3AF] font-light text-xs">
                In Progress
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-400 text-center">
                {PROCESS_SUMMARY.queued}
              </p>
              <p className="tracking-wider text-[#9CA3AF] font-light text-xs">
                Queued
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ask Anything - pinned to bottom of center column */}
      <div className="shrink-0 border-t border-white/10 bg-[#0B0719]/50 px-3 py-3 backdrop-blur-sm sm:px-4 lg:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskSubmit();
          }}
          className="flex w-full min-w-0 items-end gap-1.5 rounded-2xl border border-[#1F2937] bg-[#111827] px-1.5 py-2 sm:gap-2 sm:px-2"
        >
          <div
            className="mb-1 flex shrink-0 items-center justify-center rounded-lg p-1.5 text-amber-400/90 xl:p-2"
            aria-hidden="true"
          >
            <Zap size={18} fill="none" />
          </div>
          <input
            ref={askInputRef}
            type="text"
            placeholder="Ask Anything"
            defaultValue=""
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAskSubmit();
              }
            }}
            aria-label="Ask a question or give a command"
            className="mb-1 min-h-10 min-w-0 flex-1 border-none bg-transparent py-2.5 pl-1 pr-2 text-sm text-white outline-none placeholder:text-white/45 sm:pl-2 xl:text-base"
          />
          <button
            type="submit"
            className="mb-1 flex shrink-0 items-center justify-center rounded-lg bg-[#9333ea] p-1.5 text-white shadow-lg shadow-[#9333ea]/30 transition-all duration-200 hover:bg-[#a855f7] hover:opacity-90 xl:p-2"
            aria-label="Send message"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}

export const BrainActivity = memo(BrainActivityInner);
