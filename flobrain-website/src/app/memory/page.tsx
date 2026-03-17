"use client";

import { useState, useCallback } from "react";
import { MemoryGraph } from "./components/memory-graph/";
import { MemoryNodeDetailsDialog } from "./components/memory-node-details-dialog";
import { AddMemoryDialog } from "./components/add-memory-dialog";
import { MemoryFilter } from "./components/memory-filter";
import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@/hooks/useApi";
import { memoryNode } from "@/types/MemoryNodes";

export default function Memory() {
  const queryClient = useQueryClient();

  const [selectedNode, setSelectedNode] = useState<memoryNode | null>(null);
  const [openMemoryNodeDialog, setOpenMemoryNodeDialog] = useState<boolean>(false);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [graphActive, setGraphActive] = useState<boolean>(false);

  // Filter states (sent to API)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("All Time");
  const [memoryType, setMemoryType] = useState("All");
  const [minRelevance, setMinRelevance] = useState(0.0);

  const queryKey = ["memory", "graph", searchQuery, dateRange, memoryType, minRelevance];

  const { data: graphData, isLoading, error } = useQuery({
    queryKey,
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
    if (graphActive) setGraphActive(false);
  };

  /** Called after a node is deleted — remove it from the cached graph */
  const handleNodeDeleted = useCallback(
    (deletedId: string) => {
      queryClient.setQueryData(
        queryKey,
        (old: { nodes: memoryNode[]; links: { source: string; target: string }[] } | undefined) => {
          if (!old) return old;
          return {
            nodes: old.nodes.filter((n) => String(n.id) !== deletedId),
            links: old.links.filter(
              (l) => String(l.source) !== deletedId && String(l.target) !== deletedId
            ),
          };
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, ...queryKey]
  );

  /** Called after a new memory is added — invalidate to refresh the graph */
  const handleMemoryAdded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, ...queryKey]);

  const nodes = graphData?.nodes ?? [];
  const links = graphData?.links ?? [];

  return (
    <main
      className="flex min-h-screen flex-col items-start justify-start p-12 bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23]"
      onClick={handlePageClick}
    >
      {/* Memory Filter Component */}
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

      {/* Add Memory button */}
      <div className="w-full max-w-7xl mb-4 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setOpenAddDialog(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-2xl text-white text-sm font-medium transition-all shadow-lg hover:shadow-[#7c3aed]/40 hover:scale-[1.02]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add memory
        </button>
      </div>

      {/* Main Content: Labels and Graph */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
        {/* Memory Types Legend */}
        <div
          className="w-full lg:w-1/5 flex-shrink-0 bg-[#e194ff]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-[#4c1d95]/50 shadow-2xl text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-medium text-[#000000] mb-3">Memory Types</div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#3b82f6] rounded-full shadow-sm shadow-[#3b82f6]/30 flex-shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[#000000]">Chunks</span>
                <span className="text-[#000000] text-xs">Raw information &amp; notes</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#a78bfa] rounded-full shadow-sm shadow-[#a78bfa]/30 flex-shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[#000000]">Summaries</span>
                <span className="text-[#000000] text-xs">Condensed overviews</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#10b981] rounded-full shadow-sm shadow-[#10b981]/30 flex-shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[#000000]">Interactions</span>
                <span className="text-[#000000] text-xs">Questions &amp; feedback</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#fbbf24] rounded-full shadow-sm shadow-[#fbbf24]/30 flex-shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[#000000]">Workflows</span>
                <span className="text-[#000000] text-xs">Automated results</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#4c1d95]/60">
            <span className="text-[#000000] text-xs block">
              Node size represents relevance score
            </span>
          </div>
          <div className="mt-3 text-[#000000] text-xs opacity-70">
            {nodes.length > 0
              ? `${nodes.length} memor${nodes.length === 1 ? "y" : "ies"} loaded`
              : "No memories yet — start chatting!"}
          </div>
        </div>

        {/* Memory Graph Container */}
        <div
          className="w-full lg:w-4/5 flex flex-col items-center justify-center h-[60vh] min-h-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-[calc(60vh-5rem)] overflow-hidden rounded-xl border-4 border-[#4c1d95]/50">
            {isLoading && (
              <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
                <div className="text-zinc-400 animate-pulse">Loading memory graph…</div>
              </div>
            )}
            {error && (
              <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
                <p className="text-red-300 text-center px-4">
                  {error instanceof Error ? error.message : "Failed to load memory graph"}
                </p>
              </div>
            )}
            {!isLoading && !error && nodes.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/20 rounded-lg gap-4">
                <p className="text-zinc-400 text-center px-4">
                  No memories yet. Start chatting with CAIPO or add one manually.
                </p>
                <button
                  onClick={() => setOpenAddDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed]/80 hover:bg-[#7c3aed] rounded-xl text-white text-sm font-medium transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add first memory
                </button>
              </div>
            )}
            {!isLoading && !error && nodes.length > 0 && (
              <MemoryGraph
                nodes={nodes}
                links={links}
                onOpenMemoryNodeDialog={onOpenMemoryNodeDialog}
                graphActive={graphActive}
                setGraphActive={setGraphActive}
              />
            )}
          </div>
        </div>
      </div>

      {/* Memory Node Details Dialog (with delete) */}
      <MemoryNodeDetailsDialog
        open={openMemoryNodeDialog}
        setOpen={setOpenMemoryNodeDialog}
        node={selectedNode}
        onDeleted={handleNodeDeleted}
      />

      {/* Add Memory Dialog */}
      <AddMemoryDialog
        open={openAddDialog}
        setOpen={setOpenAddDialog}
        onAdded={handleMemoryAdded}
      />
    </main>
  );
}
