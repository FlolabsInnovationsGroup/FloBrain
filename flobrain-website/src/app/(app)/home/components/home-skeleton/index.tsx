import { Cpu, Layers, Activity } from "lucide-react";

export const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col">
      {/* Header */}
      <nav className="border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-xl bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Cpu size={18} className="text-blue-400" />
          </div>
          <div>
            <div className="h-3 bg-white/20 rounded w-24 mb-1 animate-pulse" />
            <div className="h-3 bg-white/30 rounded w-40 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <div className="h-2 bg-white/20 rounded w-24 animate-pulse" />
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Workflow Progression */}
        <aside className="w-80 border-r border-white/5 bg-slate-900/10 p-8">
          <div className="flex items-center gap-2 mb-10">
            <Layers size={14} className="text-blue-500/70" />
            <div className="h-3 bg-white/20 rounded w-48 animate-pulse" />
          </div>

          <div className="space-y-8">
            {/* Workflow Steps */}
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`workflow-${index}`} className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full border-2 border-white/20 bg-white/5 flex-shrink-0 mt-1 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded w-32 mb-2 animate-pulse" />
                  <div className="h-3 bg-white/10 rounded w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center - Core Status Display */}
        <main className="flex-1 flex items-center justify-center relative">
          {/* Large Circle */}
          <div className="relative">
            <div
              className="rounded-full border border-white/10 bg-slate-900/20 flex items-center justify-center"
              style={{ width: "400px", height: "400px" }}
            >
              <div className="text-center space-y-6">
                {/* Heartbeat Icon */}
                <Activity size={48} className="text-blue-400/50 mx-auto" />

                {/* Core Idle Text */}
                <div className="h-6 bg-white/20 rounded w-40 mx-auto animate-pulse" />
              </div>
            </div>
          </div>

          {/* Bottom Left Avatar */}
          <div className="absolute bottom-8 left-8">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <div className="h-4 bg-white/30 rounded w-4 animate-pulse" />
            </div>
          </div>
        </main>

        {/* Right Sidebar - Neural Context */}
        <aside className="w-96 border-l border-white/5 bg-slate-900/10 p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-10">
            <div className="h-3 bg-white/20 rounded w-40 animate-pulse" />
          </div>

          {/* Live Stream Section */}
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-blue-500/20 rounded w-32 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
              <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex gap-3 mt-auto">
            <div className="flex-1 h-10 bg-blue-500/30 rounded-lg border border-blue-500/50 animate-pulse" />
            <div className="flex-1 h-10 bg-white/5 rounded-lg border border-white/10 animate-pulse" />
          </div>
        </aside>
      </div>
    </div>
  );
};
