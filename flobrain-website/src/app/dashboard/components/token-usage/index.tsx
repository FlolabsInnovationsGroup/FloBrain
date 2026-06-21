"use client";

import React from "react";
import { Zap, TrendingUp } from "lucide-react";

const tokenUsageData = {
  total: "2,847,392",
  percentageChange: "+18%",
  isPositive: true,
  chartData: [
    { x: 0, y: 0.45 },
    { x: 1, y: 0.48 },
    { x: 2, y: 0.42 },
    { x: 3, y: 0.55 },
    { x: 4, y: 0.62 },
    { x: 5, y: 0.68 },
    { x: 6, y: 0.75 },
  ],
};

const CHART_W = 600;
const CHART_H = 90;
const CHART_PAD_L = 10;
const CHART_PAD_R = 10;
const CHART_PAD_T = 12;
const CHART_PAD_B = 24;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const TokenUsage = (): React.JSX.Element => {
  const { total, percentageChange, chartData } = tokenUsageData;

  const innerW = CHART_W - CHART_PAD_L - CHART_PAD_R;
  const innerH = CHART_H - CHART_PAD_T - CHART_PAD_B;

  const minY = Math.min(...chartData.map((d) => d.y));
  const maxY = Math.max(...chartData.map((d) => d.y));

  const toX = (i: number) => CHART_PAD_L + (i / (chartData.length - 1)) * innerW;
  const toY = (v: number) => CHART_PAD_T + innerH - ((v - minY) / (maxY - minY)) * innerH;

  const linePath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(2)} ${toY(d.y).toFixed(2)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${toX(chartData.length - 1).toFixed(2)} ${(CHART_PAD_T + innerH).toFixed(2)}` +
    ` L ${toX(0).toFixed(2)} ${(CHART_PAD_T + innerH).toFixed(2)} Z`;

  return (
    <div
<<<<<<< HEAD
      className="w-full lg:w-[830px] fb-dashboard-card p-6 sm:p-8 rounded-[16px] sm:rounded-[20px]"
=======
      className="w-full rounded-[18px] sm:rounded-[20px]"
      style={{
        background: "rgba(30, 18, 43, 0.72)",
        padding: "clamp(16px, 3.2vw, 28px)",
        border: "1px solid rgba(139, 92, 246, 0.28)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)",
      }}
>>>>>>> origin/main
    >
      {/* Top Section */}
      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <div>
          <h2
            className="font-semibold mb-1"
            style={{
              fontSize: "11px",
              letterSpacing: "0.5px",
              color: "var(--fb-text-muted)",
            }}
          >
            TOKEN USAGE
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "var(--fb-text-subtle)",
            }}
          >
            Last 7 days
          </p>
        </div>
        <div
          className="hidden md:flex rounded-xl items-center justify-center w-9 h-9 sm:w-11 sm:h-11"
          style={{
            background: "rgba(139, 92, 246, 0.15)",
          }}
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#8B5CF6" }} />
        </div>
      </div>

      {/* Primary Metric */}
      <div className="mb-3 sm:mb-4">
        <div
          className="font-bold mb-2 sm:mb-3"
          style={{
<<<<<<< HEAD
            fontSize: "clamp(32px, 8vw, 53px)",
            color: "var(--fb-dashboard-metric)",
=======
            fontSize: "clamp(16px, 5vw, 53px)",
            color: "#FFFFFF",
>>>>>>> origin/main
            lineHeight: "1",
            letterSpacing: "-0.02em",
          }}
        >
          {total}
        </div>

        {/* Comparison Indicator */}
        <div className="flex items-center justify-start gap-0 md:gap-2 flex-nowrap">
          <div
            className="flex items-center gap-1.5 rounded-full font-semibold bg-transparent px-0 py-0 md:bg-[rgba(0,212,146,0.15)] md:px-[10px] md:py-[5px]"
            style={{
              fontSize: "clamp(11px, 2vw, 13px)",
              color: "#00D492",
            }}
          >
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{percentageChange}</span>
          </div>
          <span
            className="ml-[5%] md:ml-0"
            style={{
              fontSize: "clamp(11px, 2vw, 13px)",
              color: "var(--fb-text-subtle)",
            }}
          >
            vs. last week
          </span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="mt-3 overflow-hidden sm:mt-5">
        {/* Mobile: minimal single trend line */}
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full md:hidden"
          style={{ height: "92px" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={linePath}
            fill="none"
            stroke="#A78BFA"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 10px rgba(167, 139, 250, 0.35))" }}
          />
        </svg>

        {/* Desktop: original chart */}
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="hidden w-full md:block"
          style={{ height: "clamp(60px, 12vw, 90px)" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#areaGrad)" />
          <path
            d={linePath}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))" }}
          />

          {chartData.map((d, i) => (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(d.y)}
              r="3"
              fill="#8B5CF6"
              stroke="var(--fb-dashboard-chart-dot-stroke)"
              strokeWidth="1.5"
            />
          ))}

          {DAY_LABELS.map((label, i) => (
            <text
              key={i}
              x={toX(i)}
              y={CHART_H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="var(--fb-dashboard-chart-label)"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
