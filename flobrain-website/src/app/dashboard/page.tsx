"use client";

import { SystemHealth } from "./components/system-health";
import { TokenUsage } from "./components/token-usage";
import { MemoryActivity } from "./components/memory-activity";
import { WorkflowEngine } from "./components/workflow-engine";

export default function Dashboard() {
  return (
    <main
      className="min-h-screen text-white px-4 py-6 sm:px-6 sm:py-8 md:p-8"
      style={{ background: "linear-gradient(116.21deg, #290036 -1.81%, #070014 100%)" }}
    >
      <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">SYSTEM DASHBOARD</h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Monitor your system health, workflows, and AI model performance
          </p>
        </div>

        {/* Top Section - System Health & Token Usage */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
          <SystemHealth />
          <TokenUsage />
        </div>

        {/* Memory Activity Section */}
        <div className="mb-4 sm:mb-6">
          <MemoryActivity />
        </div>

        {/* Workflow Engine Section */}
        <WorkflowEngine />
      </div>
    </main>
  );
}
