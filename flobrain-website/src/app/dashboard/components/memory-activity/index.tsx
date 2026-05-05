"use client";

import React from "react";
import { Database } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/hooks/useApi";

const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export const MemoryActivity = (): React.JSX.Element => {
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ["dashboard", "memory-activity"],
    queryFn: async () => {
      const result = await api.getDashboardMemoryActivity();
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Failed to load memory activity");
      }
      return result.data!;
    },
    refetchInterval: 60_000,
  });

  const heatmapData: number[][] =
    activity?.heatmap && activity.heatmap.length === 7
      ? activity.heatmap
      : HEATMAP_DAYS.map(() => Array.from({ length: 24 }, () => 0));
  const heatmapDays = HEATMAP_DAYS;

  const getHeatmapColor = (intensity: number): string => {
    if (intensity > 0.75) return "#FFEA00"; // Bright yellow - high
    if (intensity > 0.5) return "#E8D000"; // Medium-high yellow
    if (intensity > 0.25) return "#8B7000"; // Medium yellow/brown
    return "#3A3547"; // Dark purple - low activity
  };

  const todayCount = activity ? formatCount(activity.today_count) : "—";
  const weekCount = activity ? formatCount(activity.week_count) : "—";
  const totalCount = activity ? formatCount(activity.total_count) : "—";
  const weekPercentage = activity?.week_percentage ?? "—";
  const weekPositive = activity?.week_positive ?? true;

  if (error) {
    return (
      <div
        className="w-full rounded-[16px] sm:rounded-[20px]"
        style={{
          background: "rgba(30, 18, 43, 0.6)",
          padding: "clamp(16px, 4vw, 32px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)",
        }}
      >
        <h2 className="font-semibold mb-1" style={{ fontSize: "11px", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.5)" }}>
          MEMORY ACTIVITY
        </h2>
        <p style={{ fontSize: "13px", color: "#FCA5A5" }}>Failed to load memory activity. Sign in may be required.</p>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-[18px] sm:rounded-[20px]"
      style={{
        background: "rgba(30, 18, 43, 0.72)",
        padding: "clamp(16px, 3.2vw, 28px)",
        border: "1px solid rgba(139, 92, 246, 0.28)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Top Header Section */}
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div>
          <h2
            className="font-semibold mb-1"
            style={{
              fontSize: "11px",
              letterSpacing: "0.5px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            MEMORY ACTIVITY
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            {isLoading ? "Loading…" : "Last 7 days"}
          </p>
        </div>
        <div
          className="rounded-xl flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-[#6E11B080] md:bg-[rgba(255,234,0,0.12)]"
        >
          <Database className="w-4 h-4 sm:w-5 sm:h-5 text-[#C4B4FF] md:text-[#FFEA00]" />
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        {/* Card 1 - TODAY */}
        <div
          className="rounded-lg"
          style={{
            padding: "clamp(14px, 3vw, 20px)",
            background: "rgba(124, 58, 237, 0.18)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
          }}
        >
          <div
            className="mb-1.5 sm:mb-2"
            style={{
              fontSize: "10px",
              letterSpacing: "0.5px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            TODAY
          </div>
          <div
            className="font-bold mb-1"
            style={{
              fontSize: "clamp(18px, 5vw, 32px)",
              color: "#FFFFFF",
              lineHeight: "1",
            }}
          >
            {todayCount}
          </div>
          <div
            className="whitespace-nowrap"
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            chunks created
          </div>
        </div>

        {/* Card 2 - THIS WEEK */}
        <div
          className="rounded-lg"
          style={{
            padding: "clamp(14px, 3vw, 20px)",
            background: "rgba(124, 58, 237, 0.18)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
          }}
        >
          <div
            className="mb-1.5 sm:mb-2"
            style={{
              fontSize: "10px",
              letterSpacing: "0.5px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            THIS WEEK
          </div>
          <div
            className="font-bold mb-1.5 sm:mb-2"
            style={{
              fontSize: "clamp(18px, 5vw, 32px)",
              color: "#FFFFFF",
              lineHeight: "1",
            }}
          >
            {weekCount}
          </div>
          <div
            className="whitespace-nowrap"
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            {weekPercentage} trend
          </div>
        </div>

        {/* Card 3 - TOTAL */}
        <div
          className="rounded-lg"
          style={{
            padding: "clamp(14px, 3vw, 20px)",
            background: "rgba(124, 58, 237, 0.18)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
          }}
        >
          <div
            className="mb-1.5 sm:mb-2"
            style={{
              fontSize: "10px",
              letterSpacing: "0.5px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            TOTAL
          </div>
          <div
            className="font-bold mb-1"
            style={{
              fontSize: "clamp(18px, 5vw, 32px)",
              color: "#FFFFFF",
              lineHeight: "1",
            }}
          >
            {totalCount}
          </div>
          <div
            className="whitespace-nowrap"
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            all time
          </div>
        </div>
      </div>

      {/* Usage Heatmap Section */}
      <div>
        {/* Section Title and Legend */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3
            style={{
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 500,
            }}
          >
            Usage Heatmap
          </h3>
          {/* Intensity Legend */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.35)",
              }}
            >
              Less
            </span>
            <div className="flex items-center gap-1">
              <div
                className="rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#3A3547",
                }}
              />
              <div
                className="rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#8B7000",
                }}
              />
              <div
                className="rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#E8D000",
                }}
              />
              <div
                className="rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#FFEA00",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.35)",
              }}
            >
              More
            </span>
          </div>
        </div>

        {/* Desktop Heatmap — original fixed layout */}
        <div className="hidden md:flex gap-3">
          {/* Day Labels */}
          <div className="flex flex-col gap-2 pt-1 flex-shrink-0">
            {heatmapDays.map((day) => (
              <div
                key={day}
                className="flex items-center"
                style={{
                  height: "15px",
                  fontSize: "10px",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap Cells */}
          <div className="flex-1 relative">
            <div className="flex flex-col gap-2">
              {heatmapData.map((dayData, dayIndex) => (
                <div key={dayIndex} className="flex gap-3">
                  {dayData.map((intensity, hourIndex) => (
                    <div
                      key={`${dayIndex}-${hourIndex}`}
                      style={{
                        width: "15px",
                        height: "15px",
                        borderRadius: "6px",
                        background: getHeatmapColor(intensity),
                      }}
                      title={`${heatmapDays[dayIndex]} ${hourIndex}:00 - Activity: ${Math.round(intensity * 100)}%`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Time Labels — pinned to exact hour columns (cell 15px + gap 12px = 27px step) */}
            <div className="relative mt-2" style={{ height: "14px" }}>
              {[
                { label: "12 am", col: 0 },
                { label: "6 am", col: 6 },
                { label: "12 pm", col: 12 },
                { label: "6 pm", col: 18 },
                { label: "11 pm", col: 23 },
              ].map(({ label, col }) => (
                <span
                  key={label}
                  style={{
                    position: "absolute",
                    left: `${col * 27}px`,
                    fontSize: "10px",
                    color: "rgba(255, 255, 255, 0.35)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Heatmap — shrink-to-fit, no scroll */}
        <div className="md:hidden">
          <div className="flex flex-col gap-[3px]">
            {heatmapData.map((dayData, dayIndex) => (
              <div key={dayIndex} className="flex items-center gap-1.5">
                {/* Day label inline with its row */}
                <span
                  className="flex-shrink-0"
                  style={{
                    width: "24px",
                    fontSize: "8px",
                    color: "rgba(255, 255, 255, 0.4)",
                    lineHeight: "1",
                  }}
                >
                  {heatmapDays[dayIndex]}
                </span>
                {/* Cells */}
                <div className="flex-1 min-w-0 flex gap-[2px]">
                  {dayData.map((intensity, hourIndex) => (
                    <div
                      key={`m-${dayIndex}-${hourIndex}`}
                      className="flex-1"
                      style={{
                        aspectRatio: "1",
                        borderRadius: "3px",
                        background: getHeatmapColor(intensity),
                      }}
                      title={`${heatmapDays[dayIndex]} ${hourIndex}:00 - Activity: ${Math.round(intensity * 100)}%`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Time Labels — spread evenly, offset to match cell area */}
          <div className="flex justify-between mt-1.5" style={{ paddingLeft: "30px" }}>
            {["12a", "6a", "12p", "6p", "11p"].map((label) => (
              <span
                key={label}
                style={{
                  fontSize: "8px",
                  color: "rgba(255, 255, 255, 0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
