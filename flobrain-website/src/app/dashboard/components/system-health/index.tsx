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
        throw new Error(result.error ?? "Failed to load health");
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
    systemStatus === "online" ? "#00D492"
    : systemStatus === "idle" || systemStatus === "loading" ? "#F59E0B"
    : "#EF4444";
  const dotShadow =
    systemStatus === "online" ? "0 0 12px rgba(0, 212, 146, 0.6)"
    : systemStatus === "idle" || systemStatus === "loading" ? "0 0 12px rgba(245, 158, 11, 0.6)"
    : "0 0 12px rgba(239, 68, 68, 0.6)";
  const allSystemsOperational = health?.allSystemsOperational ?? false;
  const databaseStatus = health?.database ?? "unknown";
  const connectedDevices = isLoading ? "—" : (health?.connected_devices ?? "—");
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "—";

  if (error) {
    return (
      <div
        className="w-full lg:w-[830px] rounded-[16px] sm:rounded-[20px]"
        style={{
          background: "rgba(30, 18, 43, 0.6)",
          padding: "clamp(20px, 4vw, 32px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)",
        }}
      >
        <h2 className="font-semibold mb-1" style={{ fontSize: "11px", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.5)" }}>
          SYSTEM HEALTH
        </h2>
        <p style={{ fontSize: "13px", color: "#FCA5A5" }}>Unable to reach backend. Check that the API is running.</p>
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
            SYSTEM HEALTH
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.35)",
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
          <Activity className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#00D492" }} />
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
              color: "#FFFFFF",
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
                color: "rgba(255, 255, 255, 0.66)",
              }}
            >
              All systems operational
            </span>
        )}
      </div>

      <div className="mb-4">
        <p className="text-[11px] tracking-[0.5px] text-white/45 mb-1">CONNECTED DEVICES</p>
        <p className="text-2xl md:text-4xl font-semibold leading-none">{connectedDevices}</p>
      </div>

      <div className="flex items-end gap-1.5 h-8 mb-4">
        {[14, 22, 16, 26, 13, 20, 24, 15, 21, 18, 25, 17].map((height, index) => (
          <div
            key={index}
            className="w-[7px] rounded-full"
            style={{
              height: `${height}px`,
              background: "linear-gradient(180deg, #A855F7 0%, #7C3AED 100%)",
            }}
          />
        ))}
      </div>

      <div className="hidden md:flex items-center justify-between">
        <span className="text-xs text-white/50">Database</span>
        <span
          className="font-semibold capitalize"
          style={{ color: databaseStatus === "connected" ? "#00D492" : "rgba(255,255,255,0.6)" }}
        >
          {isLoading ? "—" : databaseStatus}
        </span>
      </div>
    </div>
  );
};
