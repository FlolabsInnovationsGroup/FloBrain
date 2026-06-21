"use client";

import { useEffect, useRef, useState } from "react";
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
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const selectedTypeLabel =
    TYPE_OPTIONS.find((o) => o.value === memoryType)?.label ?? "All Types";

  useEffect(() => {
    if (!typeDropdownOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (typeDropdownRef.current?.contains(event.target as Node)) return;
      setTypeDropdownOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTypeDropdownOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [typeDropdownOpen]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
<<<<<<< HEAD
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#7A6890]" />
=======
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500 sm:left-4 sm:size-4" />
>>>>>>> origin/main
        <input
          type="search"
          placeholder="Search memories by content or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
<<<<<<< HEAD
          className="w-full rounded-2xl border border-[#9B8AB8]/40 bg-white/70 py-3.5 pl-11 pr-4 text-sm text-[#2D1B4E] placeholder:text-[#7A6890] backdrop-blur-md transition focus:border-[#7B5CFF]/40 focus:outline-none focus:ring-2 focus:ring-[#7B5CFF]/20"
=======
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 backdrop-blur-md transition focus:border-[#7B5CFF]/40 focus:outline-none focus:ring-2 focus:ring-[#7B5CFF]/20 sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:pr-4 sm:text-sm"
>>>>>>> origin/main
          autoComplete="off"
        />
      </div>

<<<<<<< HEAD
      <div className="relative flex min-h-[48px] items-center gap-2 rounded-2xl border border-[#9B8AB8]/40 bg-white/70 px-4 py-2.5 backdrop-blur-md">
        <Filter className="size-4 shrink-0 text-[#7B5CFF]/90" aria-hidden />
        <span className="shrink-0 text-sm text-[#5C4A72]">Filter:</span>
        <span className="shrink-0 text-sm text-[#7A6890]">•</span>
        <select
          aria-label="Memory type filter"
          value={memoryType}
          onChange={(e) => onMemoryTypeChange(e.target.value)}
          className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent py-1 pr-6 text-sm text-zinc-100 focus:outline-none"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#12081c] text-[#2D1B4E]">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#7A6890]" />
=======
      <div ref={typeDropdownRef} className="relative">
        <div className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 backdrop-blur-md sm:min-h-[48px] sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2.5">
          <Filter className="size-3.5 shrink-0 text-[#7B5CFF]/90 sm:size-4" aria-hidden />
          <span className="shrink-0 text-xs text-zinc-400 sm:text-sm">Filter:</span>
          <span className="shrink-0 text-xs text-zinc-600 sm:text-sm">•</span>
          <button
            type="button"
            aria-label="Memory type filter"
            aria-haspopup="listbox"
            aria-expanded={typeDropdownOpen}
            onClick={() => setTypeDropdownOpen((open) => !open)}
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-lg py-1 pl-0.5 pr-0.5 text-left text-xs text-zinc-100 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B5CFF]/30 sm:pl-1 sm:pr-1 sm:text-sm"
          >
            <span className="truncate">{selectedTypeLabel}</span>
            <ChevronDown
              className={[
                "size-4 shrink-0 text-zinc-500 transition-transform duration-200",
                typeDropdownOpen ? "rotate-180 text-[#7B5CFF]/80" : "",
              ].join(" ")}
              aria-hidden
            />
          </button>
        </div>

        {typeDropdownOpen && (
          <ul
            role="listbox"
            aria-label="Memory type options"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-[#7B5CFF]/25 bg-[#0c0614]/98 py-1 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            {TYPE_OPTIONS.map((o) => {
              const active = memoryType === o.value;
              return (
                <li key={o.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onMemoryTypeChange(o.value);
                      setTypeDropdownOpen(false);
                    }}
                    className={[
                      "flex w-full items-center px-3 py-2 text-left text-xs transition sm:px-4 sm:py-2.5 sm:text-sm",
                      active
                        ? "bg-[#7B5CFF]/20 font-medium text-white"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white",
                    ].join(" ")}
                  >
                    {o.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
>>>>>>> origin/main
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
<<<<<<< HEAD
          <div className="fixed left-1/2 top-1/2 z-[1001] w-[min(100%,360px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#7B5CFF]/25 bg-[#0c0614]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-[#2D1B4E]">Advanced Filters</h2>
=======
          <div className="fixed left-1/2 top-1/2 z-[1001] flex max-h-[min(90dvh,640px)] w-[min(calc(100vw-2rem),360px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-[#7B5CFF]/25 bg-[#0c0614]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:rounded-2xl">
            <div className="shrink-0 border-b border-white/[0.06] px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-white sm:text-lg">Advanced Filters</h2>
>>>>>>> origin/main
                <button
                  type="button"
                  onClick={onToggleFilters}
                  className="text-xl leading-none text-[#5C4A72] hover:text-[#2D1B4E]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

<<<<<<< HEAD
            <div className="space-y-5 px-6 py-6">
              <div className="rounded-xl border border-[#9B8AB8]/40 bg-white/70 px-4 py-3">
                <p className="text-[13px] leading-snug text-[#5C4A72]">
=======
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6">
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 sm:rounded-xl sm:px-4 sm:py-3">
                <p className="text-xs leading-snug text-zinc-400 sm:text-[13px]">
>>>>>>> origin/main
                  Combine multiple filters to narrow down your memory search. The graph updates in
                  real-time.
                </p>
              </div>

              <div>
<<<<<<< HEAD
                <div className="text-sm font-semibold text-[#2D1B4E]">Date Range</div>
                <p className="mt-1 text-[13px] text-[#7A6890]">
=======
                <div className="text-xs font-semibold text-white sm:text-sm">Date Range</div>
                <p className="mt-1 text-xs text-zinc-500 sm:text-[13px]">
>>>>>>> origin/main
                  Show memories created within a specific time period
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
                  {["All Time", "Last Week", "Last Month", "Last Year"].map((option) => {
                    const active = dateRange === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onDateRangeChange(option)}
                        className={[
                          "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-[13px]",
                          active
                            ? "border-[#7B5CFF]/50 bg-[#7B5CFF]/20 text-[#2D1B4E]"
                            : "border-[#9B8AB8]/40 bg-white/70 text-zinc-300 hover:border-[#7B5CFF]/30",
                        ].join(" ")}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
<<<<<<< HEAD
                <div className="text-sm font-semibold text-[#2D1B4E]">Memory Type</div>
                <p className="mt-1 text-[13px] text-[#7A6890]">Filter by the type of memory content</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
=======
                <div className="text-xs font-semibold text-white sm:text-sm">Memory Type</div>
                <p className="mt-1 text-xs text-zinc-500 sm:text-[13px]">Filter by the type of memory content</p>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
>>>>>>> origin/main
                  {["All", "Chunks", "Summaries", "Interactions", "Workflows"].map((type) => {
                    const active = memoryType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onMemoryTypeChange(type)}
                        className={[
                          "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-[13px]",
                          active
                            ? "border-[#7B5CFF]/50 bg-[#7B5CFF]/20 text-[#2D1B4E]"
                            : "border-[#9B8AB8]/40 bg-white/70 text-zinc-300 hover:border-[#7B5CFF]/30",
                        ].join(" ")}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
<<<<<<< HEAD
                <div className="text-sm font-semibold text-[#2D1B4E]">
=======
                <div className="text-xs font-semibold text-white sm:text-sm">
>>>>>>> origin/main
                  Min Relevance: <span className="text-[#7B5CFF]">{minRelevance.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={minRelevance}
                  onChange={(e) => onMinRelevanceChange(Number(e.target.value))}
                  className="mt-2.5 w-full accent-[#7B5CFF] sm:mt-3"
                />
              </div>

              <button
                type="button"
                onClick={onClearFilters}
<<<<<<< HEAD
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] py-3 text-sm font-medium text-[#2D1B4E] transition hover:bg-white/[0.1]"
=======
                className="w-full rounded-lg border border-white/[0.12] bg-white/[0.06] py-2.5 text-xs font-medium text-white transition hover:bg-white/[0.1] sm:rounded-xl sm:py-3 sm:text-sm"
>>>>>>> origin/main
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
