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
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fb-memory-text-subtle)] sm:left-4 sm:size-4" />
        <input
          type="search"
          placeholder="Search memories by content or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="fb-memory-input w-full rounded-xl border py-3 pl-9 pr-3 text-xs backdrop-blur-md transition focus:border-[var(--fb-memory-btn)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fb-memory-btn)]/20 sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:pr-4 sm:text-sm"
          autoComplete="off"
        />
      </div>

      <div ref={typeDropdownRef} className="relative">
        <div className="fb-memory-input flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 py-2 backdrop-blur-md sm:min-h-[48px] sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2.5">
          <Filter className="size-3.5 shrink-0 text-[var(--fb-memory-accent)] sm:size-4" aria-hidden />
          <span className="shrink-0 text-xs text-[var(--fb-memory-text-muted)] sm:text-sm">Filter:</span>
          <span className="shrink-0 text-xs text-[var(--fb-memory-text-faint)] sm:text-sm">•</span>
          <button
            type="button"
            aria-label="Memory type filter"
            aria-haspopup="listbox"
            aria-expanded={typeDropdownOpen}
            onClick={() => setTypeDropdownOpen((open) => !open)}
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-lg py-1 pl-0.5 pr-0.5 text-left text-xs text-[var(--fb-memory-text)] transition hover:text-[var(--fb-memory-heading)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fb-memory-btn)]/30 sm:pl-1 sm:pr-1 sm:text-sm"
          >
            <span className="truncate">{selectedTypeLabel}</span>
            <ChevronDown
              className={[
                "size-4 shrink-0 text-[var(--fb-memory-text-subtle)] transition-transform duration-200",
                typeDropdownOpen ? "rotate-180 text-[var(--fb-memory-accent)]" : "",
              ].join(" ")}
              aria-hidden
            />
          </button>
        </div>

        {typeDropdownOpen && (
          <ul
            role="listbox"
            aria-label="Memory type options"
            className="fb-memory-dropdown absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border py-1 shadow-[0_16px_48px_rgba(97,0,129,0.18)] backdrop-blur-xl"
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
                        ? "font-medium text-[var(--fb-memory-nav-active-text)]"
                        : "text-[var(--fb-memory-text-muted)] hover:bg-[var(--fb-memory-nav-active-bg)] hover:text-[var(--fb-memory-heading)]",
                    ].join(" ")}
                    style={active ? { background: "var(--fb-memory-nav-active-bg)" } : undefined}
                  >
                    {o.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleFilters}
        aria-label="Advanced filters"
        className="self-start text-xs font-medium text-[var(--fb-memory-accent)] underline-offset-2 hover:text-[var(--fb-memory-btn)] hover:underline"
      >
        Advanced filters
      </button>

      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 z-[1000] backdrop-blur-sm"
            style={{ background: "var(--fb-memory-overlay)" }}
            onClick={onToggleFilters}
            aria-hidden
          />
          <div className="fb-memory-panel fixed left-1/2 top-1/2 z-[1001] flex max-h-[min(90dvh,640px)] w-[min(calc(100vw-2rem),360px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border shadow-[0_24px_80px_rgba(97,0,129,0.2)] backdrop-blur-xl sm:rounded-2xl">
            <div className="shrink-0 border-b border-[var(--fb-memory-header-border)] px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-[var(--fb-memory-heading)] sm:text-lg">Advanced Filters</h2>
                <button
                  type="button"
                  onClick={onToggleFilters}
                  className="text-xl leading-none text-[var(--fb-memory-text-muted)] hover:text-[var(--fb-memory-heading)]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6">
              <div className="fb-memory-surface rounded-lg border px-3 py-2.5 sm:rounded-xl sm:px-4 sm:py-3">
                <p className="text-xs leading-snug text-[var(--fb-memory-text-muted)] sm:text-[13px]">
                  Combine multiple filters to narrow down your memory search. The graph updates in
                  real-time.
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-[var(--fb-memory-heading)] sm:text-sm">Date Range</div>
                <p className="mt-1 text-xs text-[var(--fb-memory-text-subtle)] sm:text-[13px]">
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
                            ? "fb-memory-option-active border-[var(--fb-memory-btn)] text-[var(--fb-memory-nav-active-text)]"
                            : "border-[var(--fb-memory-surface-border)] bg-[var(--fb-memory-surface-bg)] text-[var(--fb-memory-text-muted)] hover:border-[var(--fb-memory-btn)]/40",
                        ].join(" ")}
                        style={active ? { background: "var(--fb-memory-nav-active-bg)" } : undefined}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-[var(--fb-memory-heading)] sm:text-sm">Memory Type</div>
                <p className="mt-1 text-xs text-[var(--fb-memory-text-subtle)] sm:text-[13px]">Filter by the type of memory content</p>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
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
                            ? "fb-memory-option-active border-[var(--fb-memory-btn)] text-[var(--fb-memory-nav-active-text)]"
                            : "border-[var(--fb-memory-surface-border)] bg-[var(--fb-memory-surface-bg)] text-[var(--fb-memory-text-muted)] hover:border-[var(--fb-memory-btn)]/40",
                        ].join(" ")}
                        style={active ? { background: "var(--fb-memory-nav-active-bg)" } : undefined}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-[var(--fb-memory-heading)] sm:text-sm">
                  Min Relevance: <span className="text-[var(--fb-memory-accent)]">{minRelevance.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={minRelevance}
                  onChange={(e) => onMinRelevanceChange(Number(e.target.value))}
                  className="mt-2.5 w-full accent-[var(--fb-memory-btn)] sm:mt-3"
                />
              </div>

              <button
                type="button"
                onClick={onClearFilters}
                className="w-full rounded-lg border border-[var(--fb-memory-surface-border)] bg-[var(--fb-memory-surface-bg)] py-2.5 text-xs font-medium text-[var(--fb-memory-heading)] transition hover:bg-[var(--fb-memory-btn-soft)] sm:rounded-xl sm:py-3 sm:text-sm"
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
