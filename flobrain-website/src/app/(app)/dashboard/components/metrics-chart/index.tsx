"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { tokenUsageData } from "../../mockChartData";

const chartColors = {
  stroke: "#8b5cf6",
  fill: "rgba(139, 92, 246, 0.2)",
  grid: "rgba(255,255,255,0.1)",
};

export function MetricsChart() {
  return (
    <div className="h-48 min-h-[120px] w-full min-w-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={tokenUsageData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={{ stroke: chartColors.grid }}
            tickLine={{ stroke: chartColors.grid }}
          />
          <YAxis
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={{ stroke: chartColors.grid }}
            tickLine={{ stroke: chartColors.grid }}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #4c1d95",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: number | undefined) => [`${(value ?? 0).toLocaleString()} tokens`, "Tokens"]}
          />
          <Area
            type="monotone"
            dataKey="tokens"
            stroke={chartColors.stroke}
            fill="url(#tokenGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
