"use client";

import { useState } from "react";
import { MemoryGraph } from "./components/memory-graph/";
import { MemoryNodeSidePanel } from "./components/memory-node-side-panel";
import { MemoryPlaceholderNodes, placeholderNodesForLegend } from "./components/memory-placeholder-nodes";
import { MemoryFilter } from "./components/memory-filter";
import { MemoryTypesLegend } from "./components/memory-types-legend";
import { api } from "@/lib/api";
import { useQuery } from "@/hooks/useApi";
import { memoryNode } from "@/types/MemoryNodes";

export default function Memory() {
  const [selectedNode, setSelectedNode] = useState<memoryNode | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [graphActive, setGraphActive] = useState<boolean>(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("All Time");
  const [memoryType, setMemoryType] = useState("All");
  const [minRelevance, setMinRelevance] = useState(0.0);

  const { data: graphData, isLoading, error } = useQuery({
    queryKey: ["memory", "graph", searchQuery, dateRange, memoryType, minRelevance],
    queryFn: async () => {
      const result = await api.getMemoryGraph({
        search: searchQuery || undefined,
        date_range: dateRange !== "All Time" ? dateRange : undefined,
        memory_type: memoryType !== "All" ? memoryType : undefined,
        min_relevance: minRelevance > 0 ? minRelevance : undefined,
      });
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Failed to load memory graph");
      }
      return result.data!;
    },
  });

  const toggleFilters = () => setFiltersOpen(!filtersOpen);

  function openMemoryNodePanel(node: memoryNode) {
    setSelectedNode(node);
    setSidePanelOpen(true);
  }

  const clearFilters = () => {
    setSearchQuery("");
    setDateRange("All Time");
    setMemoryType("All");
    setMinRelevance(0.0);
  };

  const handlePageClick = () => {
    if (graphActive) {
      setGraphActive(false);
    }
    if (sidePanelOpen) {
      setSidePanelOpen(false);
    }
  };

  const nodes = graphData?.nodes ?? [];
  const links = graphData?.links ?? [];

  const showingPlaceholderCanvas = isLoading || error || nodes.length === 0;
  const legendNodes = showingPlaceholderCanvas ? placeholderNodesForLegend() : nodes;

  return (
    <div
      className="fb-memory-page flex min-h-[100dvh] flex-col px-3 pb-24 pt-[5rem] font-[Inter] sm:px-4 sm:pb-28 sm:pt-[5.5rem] md:px-5 md:pb-5 md:pt-[5.5rem] lg:box-border lg:h-[100dvh] lg:max-h-[100dvh] lg:min-h-0 lg:overflow-hidden"
      onClick={handlePageClick}
    >
      <div className="fb-memory-shell mx-auto my-2 flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden rounded-xl border backdrop-blur-xl sm:my-3 sm:rounded-2xl lg:min-h-0">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto p-3 sm:gap-4 sm:p-4 lg:flex-row lg:gap-6 lg:overflow-hidden lg:p-6">
          <aside
            className="flex w-full shrink-0 flex-col gap-3 sm:gap-4 lg:max-h-full lg:min-h-0 lg:w-[min(100%,320px)] lg:max-w-[360px] lg:overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <MemoryFilter
              filtersOpen={filtersOpen}
              searchQuery={searchQuery}
              dateRange={dateRange}
              memoryType={memoryType}
              minRelevance={minRelevance}
              onSearchQueryChange={setSearchQuery}
              onDateRangeChange={setDateRange}
              onMemoryTypeChange={setMemoryType}
              onMinRelevanceChange={setMinRelevance}
              onToggleFilters={toggleFilters}
              onClearFilters={clearFilters}
            />

            <div className="fb-memory-surface rounded-xl border px-3 py-2.5 text-xs text-[var(--fb-memory-text-muted)] backdrop-blur-md sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
              {isLoading && <span className="animate-pulse">Loading memory nodes…</span>}
              {!isLoading && !error && (
                <span>{legendNodes.length.toLocaleString()} memory nodes loaded</span>
              )}
              {error && <span className="text-[var(--fb-memory-error)]">Could not load node count</span>}
            </div>

            <div className="hidden flex-1 lg:block" />

            <MemoryTypesLegend nodes={legendNodes} />
          </aside>

          <section
            className="fb-memory-canvas relative flex min-h-[min(42vh,520px)] flex-1 flex-col overflow-hidden rounded-xl border sm:min-h-[min(48vh,560px)] sm:rounded-2xl lg:min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {(isLoading || error || nodes.length === 0) && (
              <>
                <MemoryPlaceholderNodes onNodeClick={openMemoryNodePanel} />
                {isLoading && (
                  <div className="fb-memory-hint pointer-events-none absolute left-1/2 top-3 z-[2] max-w-[92%] -translate-x-1/2 rounded-full border px-3 py-1 text-[11px] backdrop-blur-md sm:top-4 sm:px-4 sm:py-1.5 sm:text-xs">
                    <span className="animate-pulse">Loading memory graph…</span>
                  </div>
                )}
                {error && (
                  <div className="pointer-events-none absolute left-1/2 top-3 z-[2] max-w-[92%] -translate-x-1/2 rounded-lg border px-3 py-1.5 text-center text-[11px] backdrop-blur-md sm:top-4 sm:max-w-[90%] sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
                    style={{
                      background: "var(--fb-memory-error-bg)",
                      borderColor: "var(--fb-memory-error-border)",
                      color: "var(--fb-memory-error-text)",
                    }}
                  >
                    {error instanceof Error ? error.message : "Failed to load memory graph"}
                  </div>
                )}
                {!isLoading && !error && nodes.length === 0 && (
                  <div className="fb-memory-hint pointer-events-none absolute bottom-3 left-1/2 z-[2] max-w-[min(92%,28rem)] -translate-x-1/2 rounded-lg border px-3 py-1.5 text-center text-[11px] backdrop-blur-md sm:bottom-4 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs">
                    No memories match your filters. Try adjusting search or filters.
                  </div>
                )}
              </>
            )}
            {!isLoading && !error && nodes.length > 0 && (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <MemoryGraph
                  nodes={nodes}
                  links={links}
                  onOpenMemoryNodeDialog={openMemoryNodePanel}
                  graphActive={graphActive}
                  setGraphActive={setGraphActive}
                />
              </div>
            )}
          </section>
        </div>
      </div>

      <MemoryNodeSidePanel open={sidePanelOpen} onOpenChange={setSidePanelOpen} node={selectedNode} />
    </div>
  );
}
