import Link from "next/link";
import { Activity, TrendingUp } from "lucide-react";
import { memoryActivityData } from "@/data/dashboardData";

export default function MemoryActivity() {
  const { chunksCreated, heatmapDays, heatmapHours, heatmapColors, timeLabels } =
    memoryActivityData;

  return (
    <div
      className="rounded-2xl p-8 border border-white/10"
      style={{
        width: "680px",
        height: "508px",
        background: "#FCFCFC29",
        borderRadius: "16px",
      }}
    >
      <h2 className="text-xl font-semibold mb-6">Memory Activity</h2>

      {/* Memory Chunks Created */}
      <Link href={chunksCreated.link} className="block mb-6">
        <div
          className="rounded-lg p-4 hover:brightness-110 active:brightness-105 transition-all cursor-pointer"
          style={{
            background: "#F3CEFF85",
            borderRadius: "8px",
            height: "108px",
          }}
        >
          <div className="flex items-start gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-700" />
            <span className="text-zinc-900 text-sm font-medium">Memory chunks created today</span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-4xl font-bold text-zinc-900">{chunksCreated.count}</span>
            <div className="flex items-center text-[#045900] text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>{chunksCreated.percentage}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Memory Usage Heatmap */}
      <div>
        <div className="text-sm text-zinc-300 mb-3">Memory Usage Heatmap (Last 7 Days)</div>
        <div className="rounded-lg p-4">
          <div className="flex flex-col gap-1.5">
            {heatmapDays.map((day, dayIndex) => (
              <div key={day} className="flex items-center">
                <span
                  className="text-xs text-zinc-400 flex-shrink-0"
                  style={{ width: "35px", textAlign: "left" }}
                >
                  {day}
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: heatmapHours }).map((_, hourIndex) => {
                    // Simulate heatmap data
                    const intensity = Math.random();
                    const color =
                      intensity > 0.6
                        ? heatmapColors.high
                        : intensity > 0.3
                          ? heatmapColors.medium
                          : heatmapColors.low;
                    return (
                      <div
                        key={`${dayIndex}-${hourIndex}`}
                        className="flex-shrink-0"
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "5px",
                          background: color,
                        }}
                        title={`${day} ${hourIndex}:00`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex justify-between text-xs text-zinc-400 mt-3"
            style={{ marginLeft: "35px" }}
          >
            {timeLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
