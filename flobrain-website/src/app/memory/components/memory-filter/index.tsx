"use client";

import { Filter, ChevronDown, Search } from "lucide-react";

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "All", label: "All Types" },
  { value: "Chunks", label: "Memory Chunks" },
  { value: "Summaries", label: "Summaries" },
  { value: "Interactions", label: "User Interactions" },
  { value: "Workflows", label: "Workflow Outputs" },
];

interface MemoryFilterProps {
  filtersOpen: boolean;
  searchQuery: string;
  dateRange: string;
  memoryType: string;
  minRelevance: number;
  onSearchQueryChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onMemoryTypeChange: (value: string) => void;
  onMinRelevanceChange: (value: number) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

export const MemoryFilter = ({
  filtersOpen,
  searchQuery,
  dateRange,
  memoryType,
  minRelevance,
  onSearchQueryChange,
  onDateRangeChange,
  onMemoryTypeChange,
  onMinRelevanceChange,
  onToggleFilters,
  onClearFilters,
}: MemoryFilterProps) => {
  return (
    <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          placeholder="Search memories by content or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 backdrop-blur-md transition focus:border-[#7B5CFF]/40 focus:outline-none focus:ring-2 focus:ring-[#7B5CFF]/20"
          autoComplete="off"
        />
      </div>

      <div className="relative flex min-h-[48px] items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 backdrop-blur-md">
        <Filter className="size-4 shrink-0 text-[#7B5CFF]/90" aria-hidden />
        <span className="shrink-0 text-sm text-zinc-400">Filter:</span>
        <span className="shrink-0 text-sm text-zinc-600">•</span>
        <select
          aria-label="Memory type filter"
          value={memoryType}
          onChange={(e) => onMemoryTypeChange(e.target.value)}
          className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent py-1 pr-6 text-sm text-zinc-100 focus:outline-none"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#12081c] text-white">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
      </div>

      <button
        type="button"
        onClick={onToggleFilters}
        aria-label="Advanced filters"
        className="self-start text-xs font-medium text-[#7B5CFF]/80 underline-offset-2 hover:text-[#7B5CFF] hover:underline"
      >
        Advanced filters
      </button>

      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm"
            onClick={onToggleFilters}
            aria-hidden
          />
          <div className="fixed left-1/2 top-1/2 z-[1001] w-[min(100%,360px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#7B5CFF]/25 bg-[#0c0614]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-white">Advanced Filters</h2>
                <button
                  type="button"
                  onClick={onToggleFilters}
                  className="text-xl leading-none text-zinc-400 hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                <p className="text-[13px] leading-snug text-zinc-400">
                  Combine multiple filters to narrow down your memory search. The graph updates in
                  real-time.
                </p>
              </div>

              <div>
                <div className="text-sm font-semibold text-white">Date Range</div>
                <p className="mt-1 text-[13px] text-zinc-500">
                  Show memories created within a specific time period
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {["All Time", "Last Week", "Last Month", "Last Year"].map((option) => {
                    const active = dateRange === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onDateRangeChange(option)}
                        className={[
                          "rounded-xl border px-3 py-2 text-[13px] font-medium transition",
                          active
                            ? "border-[#7B5CFF]/50 bg-[#7B5CFF]/20 text-white"
                            : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-[#7B5CFF]/30",
                        ].join(" ")}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-white">Memory Type</div>
                <p className="mt-1 text-[13px] text-zinc-500">Filter by the type of memory content</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {["All", "Chunks", "Summaries", "Interactions", "Workflows"].map((type) => {
                    const active = memoryType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onMemoryTypeChange(type)}
                        className={[
                          "rounded-xl border px-3 py-2 text-[13px] font-medium transition",
                          active
                            ? "border-[#7B5CFF]/50 bg-[#7B5CFF]/20 text-white"
                            : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-[#7B5CFF]/30",
                        ].join(" ")}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Min Relevance: <span className="text-[#7B5CFF]">{minRelevance.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={minRelevance}
                  onChange={(e) => onMinRelevanceChange(Number(e.target.value))}
                  className="mt-3 w-full accent-[#7B5CFF]"
                />
              </div>

              <button
                type="button"
                onClick={onClearFilters}
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] py-3 text-sm font-medium text-white transition hover:bg-white/[0.1]"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
