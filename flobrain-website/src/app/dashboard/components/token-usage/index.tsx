"use client";

import React, { useMemo } from "react";
import { Zap, TrendingDown, TrendingUp } from "lucide-react";
import { useTokenUsage } from "@/hooks/useTokenUsage";

const CHART_W = 600;
const CHART_H = 90;
const CHART_PAD_L = 10;
const CHART_PAD_R = 10;
const CHART_PAD_T = 12;
const CHART_PAD_B = 24;

function formatTokenCount(n: number): string {
  return n.toLocaleString();
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export const TokenUsage = (): React.JSX.Element => {
  const { summary, daily, quota, isLoading, error } = useTokenUsage(7);

  const chartData = useMemo(() => {
    if (!daily?.length) {
      return Array.from({ length: 7 }, (_, i) => ({ x: i, y: 0 }));
    }
    const maxTokens = Math.max(...daily.map((d) => d.total_tokens), 1);
    return daily.map((d, i) => ({
      x: i,
      y: d.total_tokens / maxTokens,
      label: formatDayLabel(d.date),
    }));
  }, [daily]);

  const dayLabels = chartData.map((d) => ("label" in d ? d.label : "") as string);

  const total = summary ? formatTokenCount(summary.total_tokens) : "—";
  const changePercent = summary?.change_percent ?? 0;
  const isPositive = changePercent >= 0;
  const percentageChange = `${isPositive ? "+" : ""}${changePercent.toFixed(0)}%`;

  const quotaPercent =
    quota?.limit_tokens && quota.limit_tokens > 0
      ? Math.min(100, Math.round((quota.used_tokens / quota.limit_tokens) * 100))
      : null;

  if (error) {
    return (
      <div className="w-full lg:w-[830px] fb-dashboard-card p-6 sm:p-8 rounded-[16px] sm:rounded-[20px]">
        <h2
          className="font-semibold mb-1"
          style={{ fontSize: "11px", letterSpacing: "0.5px", color: "var(--fb-text-muted)" }}
        >
          TOKEN USAGE
        </h2>
        <p style={{ fontSize: "13px", color: "#FCA5A5" }}>
          Failed to load token usage. Sign in may be required.
        </p>
      </div>
    );
  }

  const innerW = CHART_W - CHART_PAD_L - CHART_PAD_R;
  const innerH = CHART_H - CHART_PAD_T - CHART_PAD_B;

  const values = chartData.map((d) => d.y);
  const minY = Math.min(...values);
  const maxY = Math.max(...values, 0.001);

  const toX = (i: number) =>
    CHART_PAD_L + (i / Math.max(chartData.length - 1, 1)) * innerW;
  const toY = (v: number) =>
    CHART_PAD_T + innerH - ((v - minY) / (maxY - minY)) * innerH;

  const linePath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(2)} ${toY(d.y).toFixed(2)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${toX(chartData.length - 1).toFixed(2)} ${(CHART_PAD_T + innerH).toFixed(2)}` +
    ` L ${toX(0).toFixed(2)} ${(CHART_PAD_T + innerH).toFixed(2)} Z`;

  return (
    <div className="w-full lg:w-[830px] fb-dashboard-card p-6 sm:p-8 rounded-[16px] sm:rounded-[20px]">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
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
          <p style={{ fontSize: "11px", color: "var(--fb-text-subtle)" }}>
            {isLoading ? "Loading…" : "Last 7 days"}
          </p>
        </div>
        <div
          className="rounded-lg flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12"
          style={{ background: "rgba(139, 92, 246, 0.15)" }}
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#8B5CF6" }} />
        </div>
      </div>

      <div className="mb-3 sm:mb-4">
        <div
          className="font-bold mb-2 sm:mb-3"
          style={{
            fontSize: "clamp(32px, 8vw, 53px)",
            color: "var(--fb-dashboard-metric)",
            lineHeight: "1",
            letterSpacing: "-0.02em",
          }}
        >
          {total}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-1.5 rounded-full font-semibold"
            style={{
              padding: "5px 10px",
              background: isPositive
                ? "rgba(0, 212, 146, 0.15)"
                : "rgba(252, 165, 165, 0.15)",
              fontSize: "clamp(11px, 2vw, 13px)",
              color: isPositive ? "#00D492" : "#FCA5A5",
            }}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : (
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            <span>{isLoading ? "—" : percentageChange}</span>
          </div>
          <span style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--fb-text-subtle)" }}>
            vs. last week
          </span>
        </div>
      </div>

      {quotaPercent !== null && quota && (
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span style={{ fontSize: "11px", color: "var(--fb-text-subtle)" }}>
              Monthly quota ({quota.plan})
            </span>
            <span style={{ fontSize: "11px", color: "var(--fb-text-muted)" }}>
              {formatTokenCount(quota.used_tokens)} / {formatTokenCount(quota.limit_tokens ?? 0)}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(139, 92, 246, 0.15)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${quotaPercent}%`,
                background: quotaPercent >= 80 ? "#F59E0B" : "#8B5CF6",
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 sm:mt-5">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          style={{ height: "clamp(60px, 12vw, 90px)", overflow: "visible" }}
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

          {dayLabels.map((label, i) => (
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
