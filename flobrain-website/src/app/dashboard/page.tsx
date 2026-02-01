export default function Dashboard() {
  // Heatmap data: 7 days x 24 hours, 5 intensity levels (0-4)
  const heatmapData = [
    [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const intensityColors = [
    'bg-white/20',
    'bg-white/60',
    'bg-yellow-100',
    'bg-yellow-300',
    'bg-yellow-400',
  ];

  const cardBase = "relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 ring-1 ring-white/10 rounded-2xl shadow-2xl shadow-black/30 hover:bg-white/7 hover:border-white/20 hover:-translate-y-0.5 transition before:bg-gradient-to-b before:from-white/10 before:to-transparent before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none";
  const panelBase = "bg-violet-200/50 border border-white/40 rounded-xl p-5 shadow-sm shadow-black/10 hover:bg-violet-200/60 hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/20 transition";
  const hoverBase = "hover:bg-red-500/15 hover:border-red-500/25 transition";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 px-4 sm:px-6 lg:px-8 py-12 pb-24 relative overflow-hidden">
      {/* Subtle glow layers */}
      <div className="absolute inset-0 bg-gradient-to-tl from-purple-800/10 via-transparent to-purple-900/5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-900/5 to-purple-800/10"></div>
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight mb-1">SYSTEM DASHBOARD</h1>
            <p className="text-lg text-purple-200 leading-tight">Monitor your system health, workflows, and AI model performance</p>
          </div>

          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {/* Card 1: System Health */}
            <div className={`${cardBase} p-10`}>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight mb-6">System Health</h2>
              <div className="space-y-6">
                <div className={panelBase}>
                  <div className="flex items-center justify-between">
                    <span className="text-black/75">Brain Status</span>
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                <div className={panelBase}>
                  <div className="flex items-center justify-between">
                    <span className="text-black/75">Connected Devices</span>
                    <span className="font-semibold text-black">12</span>
                  </div>
                </div>
                <div className={panelBase}>
                  <div className="flex items-center justify-between">
                    <span className="text-black/75">Total tokens today</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-black">2,847,392</span>
                      <span className="bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-[11px] font-semibold border border-emerald-300/30 shadow-sm shadow-emerald-500/20">+18%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Memory Activity */}
            <div className={`${cardBase} p-10`}>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight mb-6">Memory Activity</h2>
              <div className="space-y-6">
                <div className={panelBase}>
                  <div className="flex items-center justify-between">
                    <span className="text-black/75">Memory chunks created today</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-black">1,247</span>
                      <span className="bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-[11px] font-semibold border border-emerald-300/30 shadow-sm shadow-emerald-500/20">+23%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Memory Usage Heatmap (Last 7 Days)</h3>
                  <div className="flex">
                    {/* Days labels */}
                    <div className="flex flex-col space-y-1 mr-2">
                      <span className="text-xs text-white/70 h-3 leading-3">Mon</span>
                      <span className="text-xs text-white/70 h-3 leading-3">Tue</span>
                      <span className="text-xs text-white/70 h-3 leading-3">Wed</span>
                      <span className="text-xs text-white/70 h-3 leading-3">Thu</span>
                      <span className="text-xs text-white/70 h-3 leading-3">Fri</span>
                      <span className="text-xs text-white/70 h-3 leading-3">Sat</span>
                      <span className="text-xs text-white/70 h-3 leading-3">Sun</span>
                    </div>
                    {/* Heatmap grid */}
                    <div className="flex-1 max-w-[400px]">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                        {heatmapData.map((dayData, dayIndex) => (
                          <div key={dayIndex} className="flex gap-[3px] mb-[3px]">
                            {dayData.map((intensity, hourIndex) => (
                              <div
                                key={hourIndex}
                                className={`w-3 h-3 rounded-[3px] ${intensityColors[intensity]}`}
                              ></div>
                            ))}
                          </div>
                        ))}
                        {/* Time labels */}
                        <div className="flex justify-between mt-1 text-xs text-white/70">
                          <span>12am</span>
                          <span>6am</span>
                          <span>12pm</span>
                          <span>6pm</span>
                          <span>11pm</span>
                        </div>
                        {/* Legend */}
                        <div className="flex justify-end space-x-1 mt-2">
                          {intensityColors.map((color, i) => (
                            <div key={i} className={`w-2 h-2 rounded-sm ${color}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={`${cardBase} p-10`}>
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight mb-6">Workflow Engine</h2>
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Recent Errors</h3>
              <div className="space-y-4">
                <div className={`flex items-start space-x-3 p-5 bg-violet-200/50 border border-white/30 rounded-xl border-l-red-500/20 shadow-sm shadow-black/10 hover:bg-violet-200/60 hover:border-red-500/30 transition`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-black font-bold">Sentiment Analysis</div>
                    <div className="text-red-600 text-sm">API rate limit exceeded</div>
                    <div className="text-black/45 text-xs">5 minutes ago</div>
                  </div>
                </div>
                <div className={`flex items-start space-x-3 p-5 bg-violet-200/50 border border-white/30 rounded-xl border-l-red-500/20 shadow-sm shadow-black/10 hover:bg-violet-200/60 hover:border-red-500/30 transition`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-black font-bold">Image Recognition</div>
                    <div className="text-red-600 text-sm">Timeout on batch processing</div>
                    <div className="text-black/45 text-xs">12 minutes ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
