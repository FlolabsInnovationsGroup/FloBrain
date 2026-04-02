"use client";

import { useState } from "react";
import { MemoryGraph } from "./components/memory-graph/";
import { MemoryNodeDetailsDialog } from "./components/memory-node-details-dialog";
import { MemoryFilter } from "./components/memory-filter";
import { MemoryTypesLegend } from "./components/memory-types-legend";
import { api } from "@/lib/api";
import { useQuery } from "@/hooks/useApi";
import { memoryNode } from "@/types/MemoryNodes";

export default function Memory() {
  const [selectedNode, setSelectedNode] = useState<memoryNode | null>(null);
  const [openMemoryNodeDialog, setOpenMemoryNodeDialog] = useState<boolean>(false);
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

  function onOpenMemoryNodeDialog(node: memoryNode) {
    setSelectedNode(node);
    setOpenMemoryNodeDialog(true);
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
  };

  const nodes = graphData?.nodes ?? [];
  const links = graphData?.links ?? [];

  return (
    <div
      className="flex min-h-[100dvh] flex-col bg-[#08040A] px-3 py-3 pb-6 md:px-5 md:py-5 lg:box-border lg:h-[100dvh] lg:max-h-[100dvh] lg:min-h-0 lg:overflow-hidden lg:pb-5"
      onClick={handlePageClick}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden rounded-2xl border border-[#7B5CFF]/22 bg-[#0a0510]/95 shadow-[0_0_80px_rgba(123,92,255,0.14)] backdrop-blur-xl lg:min-h-0">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:gap-6 lg:p-6">
          <aside
            className="flex w-full shrink-0 flex-col gap-4 lg:max-h-full lg:min-h-0 lg:w-[min(100%,320px)] lg:max-w-[360px] lg:overflow-y-auto"
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

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-zinc-400 backdrop-blur-md">
              {isLoading && <span className="animate-pulse">Loading memory nodes…</span>}
              {!isLoading && !error && (
                <span>{nodes.length.toLocaleString()} memory nodes loaded</span>
              )}
              {error && <span className="text-red-400/90">Could not load node count</span>}
            </div>

            <div className="hidden flex-1 lg:block" />

            <MemoryTypesLegend nodes={nodes} />
          </aside>

          <section
            className="relative flex min-h-[50vh] flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#08040A] lg:min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading && (
              <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[#08040A]/80">
                <p className="animate-pulse text-sm text-zinc-500">Loading memory graph…</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[#08040A]/90 p-6">
                <p className="text-center text-sm text-red-300">
                  {error instanceof Error ? error.message : "Failed to load memory graph"}
                </p>
              </div>
            )}
            {!isLoading && !error && nodes.length === 0 && (
              <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[#08040A]/90 p-6">
                <p className="text-center text-sm text-zinc-500">
                  No memories match your filters. Try adjusting search or filters.
                </p>
              </div>
            )}
            {!isLoading && !error && nodes.length > 0 && (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <MemoryGraph
                  nodes={nodes}
                  links={links}
                  onOpenMemoryNodeDialog={onOpenMemoryNodeDialog}
                  graphActive={graphActive}
                  setGraphActive={setGraphActive}
                />
              </div>
            )}
          </section>
        </div>
      </div>

      <MemoryNodeDetailsDialog
        open={openMemoryNodeDialog}
        setOpen={setOpenMemoryNodeDialog}
        node={selectedNode}
      />
    </div>
  );
}
