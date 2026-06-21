"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Clock } from "lucide-react";
import { api, DashboardErrorLogEntry } from "@/lib/api";
import { useQuery } from "@/hooks/useApi";

interface WorkflowAlert {
  id: number;
  severity: "critical" | "warning";
  title: string;
  component: string;
  timestamp: string;
}

function mapToAlert(entry: DashboardErrorLogEntry, id: number): WorkflowAlert {
  return {
    id,
    severity: entry.level === "error" ? "critical" : "warning",
    title: entry.message,
    component: "",
    timestamp: entry.timestamp,
  };
}

export const WorkflowEngine = (): React.JSX.Element => {
  const { data: logsData, isLoading, error } = useQuery({
    queryKey: ["dashboard", "error-logs"],
    queryFn: async () => {
      const result = await api.getDashboardErrorLogs();
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Failed to load error logs");
      }
      return result.data!;
    },
    refetchInterval: 60_000,
  });

  const alerts: WorkflowAlert[] = (logsData?.["error-logs"] ?? []).map(mapToAlert);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  if (error) {
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
        <h2 className="font-semibold mb-1" style={{ fontSize: "11px", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.5)" }}>
          WORKFLOW ENGINE
        </h2>
        <p style={{ fontSize: "13px", color: "#FCA5A5" }}>Failed to load error logs. Sign in may be required.</p>
      </div>
    );
  }

  return (
    <div
<<<<<<< HEAD
      className="w-full fb-dashboard-card p-6 sm:p-8 rounded-[16px] sm:rounded-[20px]"
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
      {/* Header Section */}
      <div className="grid grid-cols-[1fr_auto] items-start gap-3 sm:flex sm:items-start sm:justify-between sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2
            className="font-semibold mb-1"
            style={{
              fontSize: "11px",
              letterSpacing: "0.5px",
              color: "var(--fb-text-muted)",
            }}
          >
            WORKFLOW ENGINE
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "var(--fb-text-subtle)",
            }}
          >
            {isLoading ? "Loading…" : "Recent errors & warnings"}
          </p>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-0 sm:flex sm:items-center sm:gap-2">
          <div
            className="inline-flex w-fit justify-self-start rounded-full font-semibold"
            style={{
              padding: "5px 10px",
              background: "var(--fb-dashboard-critical-bg)",
              border: "1px solid var(--fb-dashboard-critical-border)",
              fontSize: "11px",
              color: "var(--fb-dashboard-critical-text)",
            }}
          >
            {isLoading ? "—" : `${criticalCount} Critical`}
          </div>
          <div
            className="inline-flex w-fit justify-self-start rounded-full font-semibold"
            style={{
              padding: "5px 10px",
              background: "var(--fb-dashboard-warning-bg)",
              border: "1px solid var(--fb-dashboard-warning-border)",
              fontSize: "11px",
              color: "var(--fb-dashboard-warning-text)",
            }}
          >
            {isLoading ? "—" : `${warningCount} Warnings`}
          </div>
        </div>
      </div>

      {/* Error List Section */}
<<<<<<< HEAD
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {alerts.map((alert: WorkflowAlert) => (
          <div
            key={alert.id}
            className="rounded-lg sm:rounded-xl"
            style={{
              padding: "clamp(12px, 3vw, 20px)",
              background:
                alert.severity === "critical"
                  ? "var(--fb-dashboard-critical-bg)"
                  : "var(--fb-dashboard-warning-bg)",
              border:
                alert.severity === "critical"
                  ? "1px solid var(--fb-dashboard-critical-border)"
                  : "1px solid var(--fb-dashboard-warning-border)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              {/* Top row on mobile: Icon + Timestamp */}
              <div className="flex items-center justify-between sm:hidden">
                <div className="flex-shrink-0">
=======
      {!isLoading && alerts.length === 0 ? (
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>No recent errors or warnings.</p>
      ) : (
        <div className="space-y-3 sm:space-y-3 mb-4 sm:mb-6">
          {alerts.map((alert: WorkflowAlert) => (
            <div
              key={alert.id}
              className="rounded-xl sm:rounded-xl"
              style={{
                padding: "clamp(12px, 3vw, 20px)",
                background:
                  alert.severity === "critical"
                    ? "rgba(239, 68, 68, 0.08)"
                    : "rgba(245, 158, 11, 0.1)",
                border:
                  alert.severity === "critical"
                    ? "1px solid rgba(239, 68, 68, 0.25)"
                    : "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {/* Top row on mobile: Icon + Timestamp */}
                <div className="flex items-center justify-between sm:hidden">
                  <div className="flex-shrink-0">
                    {alert.severity === "critical" ? (
                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{ width: "24px", height: "24px", background: "rgba(220, 38, 38, 0.2)" }}
                      >
                        <AlertCircle className="w-4 h-4" style={{ color: "#FCA5A5" }} />
                      </div>
                    ) : (
                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{ width: "24px", height: "24px", background: "rgba(245, 158, 11, 0.2)" }}
                      >
                        <AlertTriangle className="w-4 h-4" style={{ color: "#FCD34D" }} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" style={{ color: "rgba(255, 255, 255, 0.3)" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>
                      {alert.timestamp}
                    </span>
                  </div>
                </div>

                {/* Desktop Icon */}
                <div className="flex-shrink-0 mt-0.5 hidden sm:block">
>>>>>>> origin/main
                  {alert.severity === "critical" ? (
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{ width: "24px", height: "24px", background: "rgba(220, 38, 38, 0.2)" }}
                    >
                      <AlertCircle className="w-4 h-4" style={{ color: "var(--fb-dashboard-critical-text)" }} />
                    </div>
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{ width: "24px", height: "24px", background: "rgba(245, 158, 11, 0.2)" }}
                    >
                      <AlertTriangle className="w-4 h-4" style={{ color: "var(--fb-dashboard-warning-text)" }} />
                    </div>
                  )}
                </div>
<<<<<<< HEAD
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" style={{ color: "var(--fb-dashboard-icon-muted)" }} />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--fb-text-subtle)",
=======

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold mb-1.5 sm:mb-2"
                    style={{
                      fontSize: "clamp(12px, 2.5vw, 14px)",
                      color: "#FFFFFF",
                      lineHeight: "1.3",
                      wordBreak: "break-word",
>>>>>>> origin/main
                    }}
                  >
                    {alert.title}
                  </h3>

                  {alert.component && (
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap mt-1">
                      <code
                        className="rounded-md font-mono border border-[#9810FA4D] md:border-transparent bg-[#8200DB66] md:bg-[rgba(255,255,255,0.05)]"
                        style={{
                          padding: "3px 6px",
                          fontSize: "10px",
                          color: "rgba(255, 255, 255, 0.4)",
                          wordBreak: "break-all",
                        }}
                      >
                        {alert.component}
                      </code>
                    </div>
                  )}
                </div>

                {/* Desktop Timestamp */}
                <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" style={{ color: "rgba(255, 255, 255, 0.3)" }} />
                  <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>
                    {alert.timestamp}
                  </span>
                </div>
              </div>
<<<<<<< HEAD

              {/* Desktop Icon */}
              <div className="flex-shrink-0 mt-0.5 hidden sm:block">
                {alert.severity === "critical" ? (
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: "24px",
                      height: "24px",
                      background: "rgba(220, 38, 38, 0.2)",
                    }}
                  >
                    <AlertCircle className="w-4 h-4" style={{ color: "var(--fb-dashboard-critical-text)" }} />
                  </div>
                ) : (
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: "24px",
                      height: "24px",
                      background: "rgba(245, 158, 11, 0.2)",
                    }}
                  >
                    <AlertTriangle className="w-4 h-4" style={{ color: "var(--fb-dashboard-warning-text)" }} />
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold mb-1.5 sm:mb-2"
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    color: "var(--fb-dashboard-stat)",
                    lineHeight: "1.3",
                    wordBreak: "break-word",
                  }}
                >
                  {alert.title}
                </h3>

                <p
                  className="mb-2 sm:mb-3"
                  style={{
                    fontSize: "12px",
                    color: "var(--fb-text-muted)",
                    lineHeight: "1.5",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {alert.description}
                </p>

                {/* Tag + Link */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <code
                    className="rounded font-mono"
                    style={{
                      padding: "3px 6px",
                      background: "var(--fb-dashboard-code-bg)",
                      fontSize: "10px",
                      color: "var(--fb-text-subtle)",
                      wordBreak: "break-all",
                    }}
                  >
                    {alert.component}
                  </code>
                  <button
                    className="font-medium hover:underline"
                    style={{
                      fontSize: "11px",
                      color: "var(--fb-dashboard-link)",
                      cursor: "pointer",
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>

              {/* Desktop Timestamp */}
              <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                <Clock className="w-3.5 h-3.5" style={{ color: "var(--fb-dashboard-icon-muted)" }} />
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--fb-text-subtle)",
                  }}
                >
                  {alert.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <button
        className="w-full rounded-lg sm:rounded-xl font-medium transition-all"
        style={{
          padding: "clamp(10px, 2vw, 14px)",
          background: "rgba(139, 92, 246, 0.1)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
          fontSize: "clamp(12px, 2.5vw, 13px)",
          color: "var(--fb-dashboard-link)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
        }}
      >
        View All Errors & Logs
      </button>
=======
            </div>
          ))}
        </div>
      )}
>>>>>>> origin/main
    </div>
  );
};
