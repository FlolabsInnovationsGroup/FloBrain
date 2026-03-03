"use client";

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
    <>
      {/* Search Bar */}
      <div className="w-full max-w-2xl mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4c1d95]/30 to-[#7c3aed]/30 backdrop-blur-sm rounded-2xl border border-[#6b21a8]/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search memories (type keywords)"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="relative w-full px-6 py-4 bg-[#8B6E99]/80 backdrop-blur-xl rounded-2xl border-2 border-[#8b5cf6]/50 text-white placeholder-[#a1a1aa] text-lg font-medium focus:outline-none focus:border-[#8b5cf6]/80 focus:ring-4 focus:ring-[#8b5cf6]/20 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#8b5cf6]/30"
          />
          <svg
            className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Filter Button */}
      <div className="w-full max-w-7xl mb-8">
        <button
          onClick={onToggleFilters}
          className="group flex items-center gap-2 px-5 py-2.5 bg-[#8B6E99]/80 hover:bg-[#8B6E99]/90 backdrop-blur-sm rounded-2xl border border-[#6b21a8]/50 text-white text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#8b5cf6]/25 shadow-lg"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="group-hover:scale-110 transition-transform"
          >
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
          </svg>
          Advanced filters
        </button>
      </div>

      {/* Filter Modal */}
      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#312634]/20 backdrop-blur-[2px] z-[1000]"
            onClick={onToggleFilters}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] w-[360px] bg-[#F6E0FC] rounded-2xl border border-[#8F6C98]/60 shadow-[0_10px_30px_rgba(49,38,52,0.20)] overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <h2 className="text-[20px] font-semibold text-[#312634]">Advanced Filters</h2>
                <button
                  onClick={onToggleFilters}
                  className="text-[#312634]/70 hover:text-[#312634] text-xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
              <div className="bg-[#CDA7D8] rounded-xl border border-[#8F6C98]/70 px-4 py-3">
                <div className="flex gap-3">
                  <div className="mt-[2px] text-[#312634]/80">ⓘ</div>
                  <p className="text-[#312634]/80 text-[13px] leading-snug">
                    Combine multiple filters to narrow down your memory search. The graph updates in
                    real‑time.
                  </p>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <div className="flex items-center gap-2 text-[#312634] font-semibold">
                  <span className="text-[#312634]/80">📅</span>
                  <span>Date Range</span>
                </div>
                <p className="text-[#312634]/60 text-[13px] mt-1">
                  Show memories created within a specific time period
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {["All Time", "Last Week", "Last Month", "Last Year"].map((option) => {
                    const active = dateRange === option;
                    return (
                      <button
                        key={option}
                        onClick={() => onDateRangeChange(option)}
                        className={[
                          "rounded-lg border px-3 py-2 text-[13px] font-medium",
                          "text-[#312634] transition",
                          active
                            ? "bg-[#CDA7D8] border-[#8F6C98]/70"
                            : "bg-[#F6E0FC] border-[#8F6C98]/40 hover:border-[#8F6C98]/70",
                        ].join(" ")}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Memory Type */}
              <div>
                <div className="flex items-center gap-2 text-[#312634] font-semibold">
                  <span className="text-[#312634]/80">🏷️</span>
                  <span>Memory Type</span>
                </div>
                <p className="text-[#312634]/60 text-[13px] mt-1">
                  Filter by the type of memory content
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {["All", "Chunks", "Summaries", "Interactions", "Workflows"].map((type) => {
                    const active = memoryType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => onMemoryTypeChange(type)}
                        className={[
                          "rounded-lg border px-3 py-2 text-[13px] font-medium",
                          "text-[#312634] transition",
                          active
                            ? "bg-[#CDA7D8] border-[#8F6C98]/70"
                            : "bg-[#F6E0FC] border-[#8F6C98]/40 hover:border-[#8F6C98]/70",
                        ].join(" ")}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Min Relevance */}
              <div>
                <div className="flex items-center gap-2 text-[#312634] font-semibold">
                  <span className="text-[#312634]/80">↗</span>
                  <span>
                    Min Relevance: <span className="font-semibold">{minRelevance.toFixed(1)}</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={minRelevance}
                  onChange={(e) => onMinRelevanceChange(Number(e.target.value))}
                  className="mt-3 w-full accent-[#681187]"
                />
              </div>

              {/* Clear button */}
              <button
                onClick={onClearFilters}
                className="w-full rounded-lg border border-[#8F6C98]/60 bg-[#F6E0FC] py-3 text-[14px] font-medium text-[#312634] hover:bg-[#CDA7D8]/50 transition"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
