"use client";

import React from "react";
import { Activity } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/hooks/useApi";

export const SystemHealth = (): React.JSX.Element => {
  const { data: health, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["dashboard", "health"],
    queryFn: async () => {
      const result = await api.getDashboardHealth();
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Couldn't connect to FloBrain");
      }
      return result.data!;
    },
    refetchInterval: 30_000,
  });

  const systemStatus = health?.system_status ?? "offline";
  const brainStatus =
    systemStatus === "online" ? "Online"
    : systemStatus === "idle" ? "Idle"
    : systemStatus === "loading" ? "Loading"
    : systemStatus === "critical_error" ? "Critical Error"
    : "Offline";
  const dotColor =
    systemStatus === "online" ? "var(--fb-dashboard-success)"
    : systemStatus === "idle" || systemStatus === "loading" ? "#F59E0B"
    : "#EF4444";
  const dotShadow =
    systemStatus === "online" ? "0 0 12px rgba(0, 212, 146, 0.6)"
    : systemStatus === "idle" || systemStatus === "loading" ? "0 0 12px rgba(245, 158, 11, 0.6)"
    : "0 0 12px rgba(239, 68, 68, 0.6)";
  const allSystemsOperational = health?.allSystemsOperational ?? false;
  const databaseStatus = health?.database ?? "unknown";
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "—";
  const errorMessage =
    error instanceof Error && error.message.trim()
      ? error.message
      : "Couldn't connect to FloBrain";

  if (error) {
    return (
      <div
        className="fb-dashboard-card w-full lg:w-[830px] rounded-[16px] sm:rounded-[20px]"
        style={{
          padding: "clamp(20px, 4vw, 32px)",
        }}
      >
        <h2 className="font-semibold mb-1" style={{ fontSize: "11px", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.5)" }}>
          SYSTEM HEALTH
        </h2>
        <p style={{ fontSize: "13px", color: "#FCA5A5" }}>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div
        className="fb-dashboard-card flex h-full w-full flex-col rounded-[18px] sm:rounded-[20px]"
      style={{
        padding: "clamp(16px, 3.2vw, 28px)",
      }}
    >
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div>
          <h2
            className="font-semibold mb-1"
            style={{
              fontSize: "11px",
              letterSpacing: "0.5px",
              color: "var(--fb-dashboard-heading)",
            }}
          >
            SYSTEM HEALTH
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "var(--fb-dashboard-chart-label)",
            }}
          >
            {isLoading ? "Loading…" : `Last updated: ${lastUpdated}`}
          </p>
        </div>
        <div
          className="hidden md:flex rounded-xl items-center justify-center w-9 h-9 sm:w-11 sm:h-11"
          style={{
            background: "rgba(0, 212, 146, 0.14)",
          }}
        >
          <Activity className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--fb-dashboard-success)" }} />
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: "8px",
              height: "8px",
              background: dotColor,
              boxShadow: dotShadow,
            }}
          />
          <h3
            className="font-bold"
            style={{
              fontSize: "clamp(14px, 3.6vw, 24px)",
              color: "var(--fb-dashboard-stat)",
              lineHeight: "1.2",
            }}
          >
            {brainStatus}
          </h3>
        </div>
        {allSystemsOperational && (
            <span
              className="font-medium"
              style={{
                fontSize: "12px",
                color: "var(--fb-text-muted)",
              }}
            >
              All systems operational
            </span>
        )}
      </div>

      <div className="mt-auto hidden md:flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--fb-dashboard-chart-label)" }}>Database</span>
        <span
          className="font-semibold capitalize"
          style={{ color: databaseStatus === "connected" ? "var(--fb-dashboard-success)" : "rgba(255,255,255,0.6)" }}
        >
          {isLoading ? "—" : databaseStatus}
        </span>
      </div>
    </div>
  );
};
