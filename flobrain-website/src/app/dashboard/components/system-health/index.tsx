"use client";

import React from "react";
import { Activity, Server } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/hooks/useApi";

export const SystemHealth = (): React.JSX.Element => {
  const { data: health, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["dashboard", "health"],
    queryFn: async () => {
      const result = await api.getDashboardHealth();
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Failed to load health");
      }
      return result.data!;
    },
    refetchInterval: 30_000,
  });

  const brainStatus = health?.backend === "online" ? "Online" : "Offline";
  const allSystemsOperational = health?.allSystemsOperational ?? false;
  const databaseStatus = health?.database ?? "unknown";
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "—";

  if (error) {
    return (
      <div
        className="w-full fb-dashboard-card p-6 sm:p-8 rounded-[16px] sm:rounded-[20px]"
      >
        <h2 className="font-semibold mb-1" style={{ fontSize: "11px", letterSpacing: "0.5px", color: "var(--fb-text-muted)" }}>
          SYSTEM HEALTH
        </h2>
        <p style={{ fontSize: "13px", color: "#FCA5A5" }}>Unable to reach backend. Check that the API is running.</p>
      </div>
    );
  }

  return (
    <div
      className="w-full lg:w-[830px] fb-dashboard-card p-6 sm:p-8 rounded-[16px] sm:rounded-[20px]"
    >
      {/* Top Section */}
      <div className="flex items-start justify-between mb-5 sm:mb-8">
        <div>
          <h2
            className="font-semibold mb-1"
            style={{
              fontSize: "11px",
              letterSpacing: "0.5px",
              color: "var(--fb-text-muted)",
            }}
          >
            SYSTEM HEALTH
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "var(--fb-text-subtle)",
            }}
          >
            {isLoading ? "Loading…" : `Last updated: ${lastUpdated}`}
          </p>
        </div>
        <div
          className="rounded-lg flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12"
          style={{
            background: "rgba(0, 212, 146, 0.12)",
          }}
        >
          <Activity className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#00D492" }} />
        </div>
      </div>

      {/* Main Status Area */}
      <div className="mb-5 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: "10px",
              height: "10px",
              background: "#00D492",
              boxShadow: "0 0 12px rgba(0, 212, 146, 0.6)",
            }}
          />
          <h3
            className="font-bold"
            style={{
              fontSize: "clamp(20px, 4vw, 28px)",
              color: "var(--fb-dashboard-stat)",
              lineHeight: "1.2",
            }}
          >
            Brain Status: {brainStatus}
          </h3>
        </div>
        {allSystemsOperational && (
          <div className="flex items-center gap-2 ml-1">
            <div
              className="rounded-full"
              style={{
                width: "5px",
                height: "5px",
                background: "#00D492",
              }}
            />
            <span
              className="font-medium"
              style={{
                fontSize: "clamp(11px, 2vw, 13px)",
                color: "#00D492",
              }}
            >
              All systems operational
            </span>
          </div>
        )}
      </div>

      {/* Bottom Section - Backend & Database */}
      <div className="mb-3 sm:mb-5">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Server className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--fb-text-subtle)" }} />
            <span
              className="font-medium"
              style={{
                fontSize: "clamp(12px, 2.5vw, 15px)",
                color: "var(--fb-text-muted)",
              }}
            >
              Database
            </span>
          </div>
          <div
            className="font-bold capitalize"
            style={{
              fontSize: "clamp(18px, 4vw, 24px)",
              color: databaseStatus === "connected" ? "#00D492" : "rgba(255,255,255,0.5)",
              lineHeight: "1",
            }}
          >
            {isLoading ? "—" : databaseStatus}
          </div>
        </div>
      </div>
    </div>
  );
};
