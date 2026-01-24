'use client';

import { useState } from 'react';

export default function Memory() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState('All Time');
  const [memoryType, setMemoryType] = useState('All');
  const [minRelevance, setMinRelevance] = useState(0.0);

  const toggleFilters = () => setFiltersOpen(!filtersOpen);

  return (
    <main className="flex min-h-screen flex-col items-start justify-center p-12 bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23]">
      {/* Search Bar (moved closer to top) */}
      <div className="w-full max-w-2xl mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4c1d95]/30 to-[#7c3aed]/30 backdrop-blur-sm rounded-2xl border border-[#6b21a8]/40 pointer-events-none"></div>
          <input
            type="text"
            placeholder="Search memories (type keywords)"
            className="relative w-full px-6 py-4 bg-[#8B6E99]/80 backdrop-blur-xl rounded-2xl border-2 border-[#8b5cf6]/50 text-white placeholder-[#a1a1aa] text-lg font-medium focus:outline-none focus:border-[#8b5cf6]/80 focus:ring-4 focus:ring-[#8b5cf6]/20 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#8b5cf6]/30"
          />
          <svg
            className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>

      {/* Filter Button Row */}
      <div className="w-full max-w-7xl mx-auto mt-4 px-2">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={toggleFilters}
            className="group flex items-center gap-2 px-5 py-2.5 bg-[#8B6E99]/80 hover:bg-[#8B6E99]/80 backdrop-blur-sm rounded-2xl border border-[#6b21a8]/50 text-white text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#8b5cf6]/25 shadow-lg"
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
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"></polygon>
            </svg>
            Advanced filters
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="relative h-[400px] w-full max-w-7xl mx-auto mt-4">
        {/* Graph container */}
        <div className="relative h-full w-full max-h-[400px] max-w-[1000px]"></div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="lineBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6"></stop>
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.8"></stop>
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4"></stop>
            </linearGradient>
            <linearGradient id="linePurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6"></stop>
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8"></stop>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4"></stop>
            </linearGradient>
            <linearGradient id="lineGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6"></stop>
              <stop offset="50%" stopColor="#059669" stopOpacity="0.8"></stop>
              <stop offset="100%" stopColor="#047857" stopOpacity="0.4"></stop>
            </linearGradient>
            <linearGradient id="lineYellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6"></stop>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4"></stop>
            </linearGradient>
          </defs>

          {/* Random dense connections (blue, purple, green, yellow) */}
          <line x1="120" y1="100" x2="350" y2="320" stroke="url(#lineBlue)" strokeWidth="2" />
          <line x1="350" y1="320" x2="550" y2="180" stroke="url(#lineBlue)" strokeWidth="2" />
          <line x1="550" y1="180" x2="780" y2="380" stroke="url(#lineBlue)" strokeWidth="2" />
          <line x1="780" y1="380" x2="1050" y2="240" stroke="url(#lineBlue)" strokeWidth="2" />
          <line x1="200" y1="80" x2="450" y2="450" stroke="url(#lineBlue)" strokeWidth="1.5" />
          <line x1="480" y1="450" x2="680" y2="120" stroke="url(#lineBlue)" strokeWidth="1.5" />
          <line x1="700" y1="120" x2="900" y2="360" stroke="url(#lineBlue)" strokeWidth="1.5" />
          <line x1="100" y1="200" x2="500" y2="250" stroke="url(#lineBlue)" strokeWidth="1.5" />
          <line x1="300" y1="150" x2="800" y2="300" stroke="url(#lineBlue)" strokeWidth="1.5" />
          <line x1="600" y1="100" x2="950" y2="320" stroke="url(#lineBlue)" strokeWidth="1.5" />
          <line x1="150" y1="350" x2="700" y2="220" stroke="url(#lineBlue)" strokeWidth="1.5" />
          <line x1="400" y1="400" x2="1000" y2="180" stroke="url(#lineBlue)" strokeWidth="1.5" />

          <line x1="220" y1="120" x2="420" y2="280" stroke="url(#linePurple)" strokeWidth="1.8" />
          <line x1="420" y1="280" x2="620" y2="160" stroke="url(#linePurple)" strokeWidth="1.8" />
          <line x1="620" y1="160" x2="850" y2="360" stroke="url(#linePurple)" strokeWidth="1.8" />
          <line x1="850" y1="360" x2="1100" y2="220" stroke="url(#linePurple)" strokeWidth="1.8" />
          <line x1="260" y1="90" x2="500" y2="430" stroke="url(#linePurple)" strokeWidth="1.5" />
          <line x1="520" y1="430" x2="720" y2="140" stroke="url(#linePurple)" strokeWidth="1.5" />
          <line x1="720" y1="140" x2="930" y2="340" stroke="url(#linePurple)" strokeWidth="1.5" />
          <line x1="180" y1="220" x2="520" y2="270" stroke="url(#linePurple)" strokeWidth="1.5" />
          <line x1="320" y1="170" x2="820" y2="320" stroke="url(#linePurple)" strokeWidth="1.5" />
          <line x1="620" y1="120" x2="970" y2="340" stroke="url(#linePurple)" strokeWidth="1.5" />
          <line x1="170" y1="370" x2="720" y2="240" stroke="url(#linePurple)" strokeWidth="1.5" />
          <line x1="420" y1="420" x2="1020" y2="200" stroke="url(#linePurple)" strokeWidth="1.5" />

          <line x1="240" y1="140" x2="440" y2="300" stroke="url(#lineGreen)" strokeWidth="1.6" />
          <line x1="440" y1="300" x2="640" y2="180" stroke="url(#lineGreen)" strokeWidth="1.6" />
          <line x1="640" y1="180" x2="870" y2="380" stroke="url(#lineGreen)" strokeWidth="1.6" />
          <line x1="870" y1="380" x2="1120" y2="240" stroke="url(#lineGreen)" strokeWidth="1.6" />
          <line x1="280" y1="110" x2="520" y2="450" stroke="url(#lineGreen)" strokeWidth="1.4" />
          <line x1="540" y1="450" x2="740" y2="160" stroke="url(#lineGreen)" strokeWidth="1.4" />
          <line x1="740" y1="160" x2="950" y2="360" stroke="url(#lineGreen)" strokeWidth="1.4" />
          <line x1="200" y1="240" x2="540" y2="290" stroke="url(#lineGreen)" strokeWidth="1.4" />
          <line x1="340" y1="190" x2="840" y2="340" stroke="url(#lineGreen)" strokeWidth="1.4" />
          <line x1="640" y1="140" x2="990" y2="360" stroke="url(#lineGreen)" strokeWidth="1.4" />
          <line x1="190" y1="390" x2="740" y2="260" stroke="url(#lineGreen)" strokeWidth="1.4" />
          <line x1="440" y1="440" x2="1040" y2="220" stroke="url(#lineGreen)" strokeWidth="1.4" />

          <line x1="260" y1="160" x2="460" y2="320" stroke="url(#lineYellow)" strokeWidth="1.7" />
          <line x1="460" y1="320" x2="660" y2="200" stroke="url(#lineYellow)" strokeWidth="1.7" />
          <line x1="660" y1="200" x2="890" y2="400" stroke="url(#lineYellow)" strokeWidth="1.7" />
          <line x1="890" y1="400" x2="1140" y2="260" stroke="url(#lineYellow)" strokeWidth="1.7" />
          <line x1="300" y1="130" x2="540" y2="470" stroke="url(#lineYellow)" strokeWidth="1.5" />
          <line x1="560" y1="470" x2="760" y2="180" stroke="url(#lineYellow)" strokeWidth="1.5" />
          <line x1="760" y1="180" x2="970" y2="380" stroke="url(#lineYellow)" strokeWidth="1.5" />
          <line x1="220" y1="260" x2="560" y2="310" stroke="url(#lineYellow)" strokeWidth="1.5" />
          <line x1="360" y1="210" x2="860" y2="360" stroke="url(#lineYellow)" strokeWidth="1.5" />
          <line x1="660" y1="160" x2="1010" y2="380" stroke="url(#lineYellow)" strokeWidth="1.5" />
          <line x1="210" y1="410" x2="760" y2="280" stroke="url(#lineYellow)" strokeWidth="1.5" />
          <line x1="460" y1="460" x2="1060" y2="240" stroke="url(#lineYellow)" strokeWidth="1.5" />
        
          <circle cx="120" cy="100" r="28" fill="url(#blueNode)" className="node" />
    <circle cx="350" cy="320" r="24" fill="url(#blueNode)" className="node" />
    <circle cx="550" cy="180" r="32" fill="url(#blueNode)" className="node" />
    <circle cx="780" cy="380" r="20" fill="url(#blueNode)" className="node" />
    <circle cx="1050" cy="240" r="28" fill="url(#blueNode)" className="node" />
    <circle cx="200" cy="80" r="16" fill="url(#blueNode)" className="node" />
    <circle cx="450" cy="450" r="20" fill="url(#blueNode)" className="node" />
    <circle cx="680" cy="120" r="24" fill="url(#blueNode)" className="node" />
    <circle cx="900" cy="360" r="20" fill="url(#blueNode)" className="node" />
    <circle cx="100" cy="200" r="18" fill="url(#blueNode)" className="node" />
    
    {/* Purple Nodes (Summaries) */}
    <circle cx="220" cy="120" r="24" fill="url(#purpleNode)" className="node" />
    <circle cx="420" cy="280" r="20" fill="url(#purpleNode)" className="node" />
    <circle cx="620" cy="160" r="26" fill="url(#purpleNode)" className="node" />
    <circle cx="850" cy="360" r="18" fill="url(#purpleNode)" className="node" />
    <circle cx="1100" cy="220" r="22" fill="url(#purpleNode)" className="node" />
    <circle cx="260" cy="90" r="18" fill="url(#purpleNode)" className="node" />
    
    {/* Green Nodes (Interactions) */}
    <circle cx="240" cy="140" r="26" fill="url(#greenNode)" className="node" />
    <circle cx="440" cy="300" r="22" fill="url(#greenNode)" className="node" />
    <circle cx="640" cy="180" r="18" fill="url(#greenNode)" className="node" />
    <circle cx="870" cy="380" r="20" fill="url(#greenNode)" className="node" />
    
    {/* Yellow Nodes (Workflows) */}
    <circle cx="260" cy="160" r="30" fill="url(#yellowNode)" className="node" />
    <circle cx="460" cy="320" r="24" fill="url(#yellowNode)" className="node" />
    <circle cx="660" cy="200" r="28" fill="url(#yellowNode)" className="node" />
    <circle cx="890" cy="400" r="20" fill="url(#yellowNode)" className="node" />
    <circle cx="1140" cy="260" r="22" fill="url(#yellowNode)" className="node" />
    <circle cx="300" cy="130" r="20" fill="url(#yellowNode)" className="node" />
    <circle cx="540" cy="470" r="22" fill="url(#yellowNode)" className="node" />
        </svg></div>

      {/* Memory Types Legend */}
      <div className="flex flex-col bottom-6 left-24 bg-[#e194ff]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-[#4c1d95]/50 shadow-2xl text-sm">
        <div className="font-medium text-[#000000] mb-3">Memory Types</div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#3b82f6] rounded-full shadow-sm shadow-[#3b82f6]/30"></div>
            <div className="flex flex-col leading-tight">
              <span className="text-[#000000]">Chunks</span>
              <span className="text-[#000000] text-xs">Raw information & notes</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#a78bfa] rounded-full shadow-sm shadow-[#a78bfa]/30"></div>
            <div className="flex flex-col leading-tight">
              <span className="text-[#000000]">Summaries</span>
              <span className="text-[#000000] text-xs">Condensed overviews</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#10b981] rounded-full shadow-sm shadow-[#10b981]/30"></div>
            <div className="flex flex-col leading-tight">
              <span className="text-[#000000]">Interactions</span>
              <span className="text-[#000000] text-xs">Questions & feedback</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#fbbf24] rounded-full shadow-sm shadow-[#fbbf24]/30"></div>
            <div className="flex flex-col leading-tight">
              <span className="text-[#000000]">Workflows</span>
              <span className="text-[#000000] text-xs">Automated results</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#4c1d95]/60">
            <div className="flex items-center gap-3">
              <span className="text-[#000000] text-xs">Node size represents relevance score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {filtersOpen && (
        <>
          {/* Backdrop (light, not dark) */}
          <div
            className="fixed inset-0 bg-[#312634]/20 backdrop-blur-[2px] z-[1000]"
            onClick={toggleFilters}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] w-[360px] bg-[#F6E0FC] rounded-2xl border border-[#8F6C98]/60 shadow-[0_10px_30px_rgba(49,38,52,0.20)] overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <h2 className="text-[20px] font-semibold text-[#312634]">Advanced Filters</h2>

                <button
                  onClick={toggleFilters}
                  className="text-[#312634]/70 hover:text-[#312634] text-xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Info box */}
              <div className="bg-[#CDA7D8] rounded-xl border border-[#8F6C98]/70 px-4 py-3">
                <div className="flex gap-3">
                  <div className="mt-[2px] text-[#312634]/80">ⓘ</div>
                  <p className="text-[#312634]/80 text-[13px] leading-snug">
                    Combine multiple filters to narrow down your memory search. The graph updates in real‑time.
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
                  {['All Time', 'Last Week', 'Last Month', 'Last Year'].map((option) => {
                    const active = dateRange === option;
                    return (
                      <button
                        key={option}
                        onClick={() => setDateRange(option)}
                        className={[
                          'rounded-lg border px-3 py-2 text-[13px] font-medium',
                          'text-[#312634] transition',
                          active
                            ? 'bg-[#CDA7D8] border-[#8F6C98]/70'
                            : 'bg-[#F6E0FC] border-[#8F6C98]/40 hover:border-[#8F6C98]/70',
                        ].join(' ')}
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
                  {['Chunks', 'Summaries', 'Interactions', 'Workflows'].map((type) => {
                    const active = memoryType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setMemoryType(type)}
                        className={[
                          'rounded-lg border px-3 py-2 text-[13px] font-medium',
                          'text-[#312634] transition',
                          active
                            ? 'bg-[#CDA7D8] border-[#8F6C98]/70'
                            : 'bg-[#F6E0FC] border-[#8F6C98]/40 hover:border-[#8F6C98]/70',
                        ].join(' ')}
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
                  onChange={(e) => setMinRelevance(Number(e.target.value))}
                  className="mt-3 w-full accent-[#681187]"
                />
              </div>

              {/* Clear button */}
              <button
                className="w-full rounded-lg border border-[#8F6C98]/60 bg-[#F6E0FC] py-3 text-[14px] font-medium text-[#312634] hover:bg-[#CDA7D8]/50 transition"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4c1d95, #6b21a8);
          border-radius: 3px;
        }
      `}</style>
    </main>
  );
}
