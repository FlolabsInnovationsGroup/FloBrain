export const MemorySkeleton = () => {
  return (
    <div className="flex min-h-screen flex-col items-start justify-start p-12 bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23]">
      {/* Header Skeleton */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 bg-white/10 rounded w-80 animate-pulse" />
        </div>
        <div className="h-5 bg-white/5 rounded w-[600px] animate-pulse" />
      </div>

      {/* Main Content: Legend and Graph */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
        {/* Memory Types Legend Skeleton */}
        <div 
          className="w-full lg:w-1/5 flex-shrink-0 bg-[#e194ff]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-[#4c1d95]/50 shadow-2xl"
        >
          <div className="h-5 bg-[#4c1d95]/40 rounded w-32 mb-3 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-2">
            {/* Memory Type Items */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`legend-${index}`} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  index === 0 ? "bg-[#3b82f6]" :
                  index === 1 ? "bg-[#a78bfa]" :
                  index === 2 ? "bg-[#10b981]" :
                  "bg-[#fbbf24]"
                }`} />
                <div className="flex flex-col leading-tight flex-1">
                  <div className="h-4 bg-[#4c1d95]/40 rounded w-20 mb-1 animate-pulse" />
                  <div className="h-3 bg-[#4c1d95]/30 rounded w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#4c1d95]/60">
            <div className="h-3 bg-[#4c1d95]/40 rounded w-full animate-pulse" />
          </div>
        </div>

        {/* Memory Graph Container Skeleton */}
        <div className="w-full lg:w-4/5 flex flex-col items-center justify-center h-[60vh] min-h-0">
          {/* Graph Placeholder */}
          <div className="w-full h-[calc(60vh-5rem)] overflow-hidden rounded-xl border-4 border-[#4c1d95]/50 bg-[#1a0033]/50 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="h-8 bg-white/10 rounded w-64 mx-auto animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-48 mx-auto animate-pulse" />
                
                {/* Simulated Graph Nodes */}
                <div className="relative w-[600px] h-[400px] mx-auto mt-8">
                  {Array.from({ length: 8 }).map((_, index) => {
                    const positions = [
                      { top: "20%", left: "30%" },
                      { top: "15%", left: "60%" },
                      { top: "40%", left: "20%" },
                      { top: "35%", left: "70%" },
                      { top: "60%", left: "40%" },
                      { top: "65%", left: "65%" },
                      { top: "75%", left: "25%" },
                      { top: "80%", left: "80%" },
                    ];
                    
                    return (
                      <div
                        key={`node-${index}`}
                        className={`absolute rounded-full ${
                          index % 4 === 0 ? "bg-[#3b82f6]/50" :
                          index % 4 === 1 ? "bg-[#a78bfa]/50" :
                          index % 4 === 2 ? "bg-[#10b981]/50" :
                          "bg-[#fbbf24]/50"
                        }`}
                        style={{
                          top: positions[index].top,
                          left: positions[index].left,
                          width: `${40 + (index % 3) * 20}px`,
                          height: `${40 + (index % 3) * 20}px`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
