"use client";

import { useState } from "react";
import { MemoryGraph } from "./components/memory-graph/";
import { MemoryNodeDetailsDialog } from "./components/memory-node-details-dialog";
import { MemoryFilter } from "./components/memory-filter";
import { memoryNode } from "../../types/MemoryNodes";

export default function Memory() {
  const [selectedNode, setSelectedNode] = useState<memoryNode | null>(null);
  const [openMemoryNodeDialog, setOpenMemoryNodeDialog] = useState<boolean>(false);
  const [graphActive, setGraphActive] = useState<boolean>(false);
  
  // Filter states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("All Time");
  const [memoryType, setMemoryType] = useState("All");
  const [minRelevance, setMinRelevance] = useState(0.0);

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

      {/* Main Content: Labels and Graph */}
      <div className="flex items-end gap-4 w-full max-w-screen">
      {/* Memory Types Legend */}
      <div 
        className="w-1/5 flex-shrink-0 bg-[#e194ff]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-[#4c1d95]/50 shadow-2xl text-sm"
        onClick={(e) => e.stopPropagation()}
      >
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
        </div>
        <div className="mt-4 pt-3 border-t border-[#4c1d95]/60">
          <div className="flex items-center gap-3">
            <span className="text-[#000000] text-xs">Node size represents relevance score</span>
          </div>
        </div>
      </div>

      {/* Memory Graph Container */}
      <div 
        className="flex-1 flex flex-col items-center justify-center relative h-[600px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Speech Bubble - Outside the graph */}
        <div className="mb-4 z-10">
          <div className="relative bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-[#a78bfa]">
            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
              {graphActive 
                ? "Click outside the graph to navigate the memory page" 
                : "Click inside the border to interact with the graph"}
            </p>
            {/* Speech bubble arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-[#a78bfa]"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
              </div>
            </div>
          </div>
        </div>

        {/* Memory Graph */}
        <div className="w-full flex-1">
          <MemoryGraph 
            onOpenMemoryNodeDialog={onOpenMemoryNodeDialog}
            graphActive={graphActive}
            setGraphActive={setGraphActive}
          />
        </div>
      </div>
    </div>

      
      {/* Memory Node Details Dialog */}
      <MemoryNodeDetailsDialog
        open={openMemoryNodeDialog}
        setOpen={setOpenMemoryNodeDialog}
        description={selectedNode?.name}
      />
    </main>
  );
}
