export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-white/10 rounded w-80 mb-2" />
        <div className="h-5 bg-white/5 rounded w-96" />
      </div>

      {/* Top Section - System Health & Memory Activity Skeleton */}
      <div className="flex gap-6 mb-6">
        {/* System Health Skeleton */}
        <div
          className="rounded-2xl p-8 border border-white/10"
          style={{
            width: "680px",
            height: "430px",
            background: "#FCFCFC29",
          }}
        >
          <div className="h-6 bg-white/20 rounded w-40 mb-6" />

          <div
            className="rounded-lg p-4 mb-3 flex items-center justify-between"
            style={{ background: "#F3CEFF85", height: "53px" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-white/30 rounded" />
              <div className="h-4 bg-white/30 rounded w-24" />
            </div>
            <div className="h-4 bg-white/30 rounded w-16" />
          </div>

          <div
            className="rounded-lg p-4 mb-3 flex items-center justify-between"
            style={{ background: "#F3CEFF85", height: "53px" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-white/30 rounded" />
              <div className="h-4 bg-white/30 rounded w-32" />
            </div>
            <div className="h-6 bg-white/30 rounded w-8" />
          </div>

          <div className="rounded-lg p-4" style={{ background: "#F3CEFF85" }}>
            <div className="h-4 bg-white/30 rounded w-32 mb-2" />
            <div className="flex items-center gap-2">
              <div className="h-10 bg-white/30 rounded w-48" />
              <div className="h-5 bg-white/30 rounded w-16" />
            </div>
          </div>
        </div>

        {/* Memory Activity Skeleton */}
        <div
          className="rounded-2xl p-8 border border-white/10"
          style={{
            width: "680px",
            height: "508px",
            background: "#FCFCFC29",
          }}
        >
          <div className="h-6 bg-white/20 rounded w-40 mb-6" />

          <div className="rounded-lg p-4 mb-6" style={{ background: "#F3CEFF85", height: "108px" }}>
            <div className="flex items-start gap-2 mb-2">
              <div className="w-5 h-5 bg-white/30 rounded" />
              <div className="h-4 bg-white/30 rounded w-48" />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="h-10 bg-white/30 rounded w-32" />
              <div className="h-5 bg-white/30 rounded w-16" />
            </div>
          </div>

          <div>
            <div className="h-4 bg-white/20 rounded w-56 mb-3" />
            <div className="rounded-lg p-4">
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 7 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex items-center">
                    <div className="h-4 bg-white/20 rounded w-8 mr-2" />
                    <div className="flex gap-1.5">
                      {Array.from({ length: 24 }).map((_, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className="bg-white/10 flex-shrink-0"
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "5px",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs mt-3" style={{ marginLeft: "35px" }}>
                <div className="h-3 bg-white/20 rounded w-10" />
                <div className="h-3 bg-white/20 rounded w-10" />
                <div className="h-3 bg-white/20 rounded w-10" />
                <div className="h-3 bg-white/20 rounded w-10" />
                <div className="h-3 bg-white/20 rounded w-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Engine Skeleton */}
      <div className="rounded-2xl p-6 border border-white/10" style={{ background: "#FCFCFC29" }}>
        <div className="h-6 bg-white/20 rounded w-40 mb-4" />

        <div className="mb-3">
          <div className="h-5 bg-white/20 rounded w-32 mb-3" />

          <div
            className="rounded-lg p-4 mb-3"
            style={{ background: "#FC444736", border: "2px solid #D00003" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-white/30 rounded-full mt-1" />
              <div className="flex-1">
                <div className="h-4 bg-white/30 rounded w-40 mb-3" />
                <div className="h-3 bg-white/30 rounded w-full mb-2" />
                <div className="h-3 bg-white/30 rounded w-24" />
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-4"
            style={{ background: "#FC444736", border: "2px solid #D00003" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-white/30 rounded-full mt-1" />
              <div className="flex-1">
                <div className="h-4 bg-white/30 rounded w-40 mb-3" />
                <div className="h-3 bg-white/30 rounded w-full mb-2" />
                <div className="h-3 bg-white/30 rounded w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
