"use client";

import { SystemHealth } from "./components/system-health";
import { MemoryActivity } from "./components/memory-activity";
import { WorkflowEngine } from "./components/workflow-engine";

export default function Dashboard() {
  return (
    <main
      className="min-h-screen text-white p-8"
      style={{ background: "linear-gradient(116.21deg, #290036 -1.81%, #070014 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">SYSTEM DASHBOARD</h1>
          <p className="text-zinc-400">
            Monitor your system health, workflows, and AI model performance
          </p>
        </div>

        {/* Top Section - System Health & Memory Activity */}
        <div className="flex gap-6 mb-6">
          <SystemHealth />
          <MemoryActivity />
        </div>

        {/* Workflow Engine Section */}
        <WorkflowEngine />
      </div>
    </main>
  );
}
