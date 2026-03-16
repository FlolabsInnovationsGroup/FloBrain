"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Clock, Info, X, Lightbulb } from "lucide-react";
import { useQuery } from "@/hooks/useApi";
import { api, WorkflowErrorApi } from "@/lib/api";

export const WorkflowEngine = (): React.JSX.Element => {
  const [viewingError, setViewingError] = useState<WorkflowErrorApi | null>(null);

  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ["dashboard", "workflow-errors"],
    queryFn: async () => {
      const r = await api.getWorkflowErrors();
      if (r.error) throw new Error(r.error);
      return r.data ?? [];
    },
    refetchInterval: 30000,
  });

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  const severityColor = (severity: WorkflowErrorApi["severity"]) => {
    if (severity === "critical") return { bg: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.2)" };
    if (severity === "warning") return { bg: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" };
    return { bg: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)" };
  };

  const severityIconColor = (severity: WorkflowErrorApi["severity"]) => {
    if (severity === "critical") return { bg: "rgba(220, 38, 38, 0.2)", color: "#FCA5A5" };
    if (severity === "warning") return { bg: "rgba(245, 158, 11, 0.2)", color: "#FCD34D" };
    return { bg: "rgba(59, 130, 246, 0.2)", color: "#93C5FD" };
  };

  const SeverityIcon = ({ severity, size = "w-4 h-4" }: { severity: WorkflowErrorApi["severity"]; size?: string }) => {
    const { bg, color } = severityIconColor(severity);
    const Icon = severity === "critical" ? AlertCircle : severity === "warning" ? AlertTriangle : Info;
    return (
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: "24px", height: "24px", background: bg }}
      >
        <Icon className={size} style={{ color }} />
      </div>
    );
  };

  const severityBadgeStyle = (severity: WorkflowErrorApi["severity"]) => {
    if (severity === "critical") return { bg: "rgba(220, 38, 38, 0.2)", border: "1px solid rgba(220, 38, 38, 0.4)", color: "#FCA5A5" };
    if (severity === "warning") return { bg: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#FCD34D" };
    return { bg: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#93C5FD" };
  };

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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2
            className="font-semibold mb-1"
            style={{ fontSize: "11px", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.5)" }}
          >
            WORKFLOW ENGINE
          </h2>
          <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.35)" }}>
            Recent errors &amp; warnings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="rounded-full font-semibold"
            style={{
              padding: "5px 10px",
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              fontSize: "11px",
              color: "#FCA5A5",
            }}
          >
            {criticalCount} Critical
          </div>
          <div
            className="rounded-full font-semibold"
            style={{
              padding: "5px 10px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              fontSize: "11px",
              color: "#FCD34D",
            }}
          >
            {warningCount} Warnings
          </div>
        </div>
      </div>

      {/* Error List Section */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg sm:rounded-xl animate-pulse"
                style={{
                  padding: "clamp(12px, 3vw, 20px)",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  height: "80px",
                }}
              />
            ))}
          </>
        )}

        {!isLoading && error && (
          <div
            className="rounded-lg text-center"
            style={{
              padding: "20px",
              background: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              fontSize: "13px",
              color: "#FCA5A5",
            }}
          >
            {error instanceof Error ? error.message : "Failed to load workflow errors"}
          </div>
        )}

        {!isLoading && !error && alerts.length === 0 && (
          <div
            className="rounded-lg text-center"
            style={{
              padding: "24px",
              background: "rgba(34, 197, 94, 0.06)",
              border: "1px solid rgba(34, 197, 94, 0.15)",
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>✓</div>
            No active errors
          </div>
        )}

        {!isLoading && !error && alerts.map((alert) => {
          const { bg, border } = severityColor(alert.severity);
          return (
            <div
              key={alert.id}
              className="rounded-lg sm:rounded-xl"
              style={{ padding: "clamp(12px, 3vw, 20px)", background: bg, border }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {/* Mobile: Icon + Timestamp row */}
                <div className="flex items-center justify-between sm:hidden">
                  <div className="flex-shrink-0">
                    <SeverityIcon severity={alert.severity} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" style={{ color: "rgba(255, 255, 255, 0.3)" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>
                      {alert.timestamp_relative}
                    </span>
                  </div>
                </div>

                {/* Desktop Icon */}
                <div className="flex-shrink-0 mt-0.5 hidden sm:block">
                  <SeverityIcon severity={alert.severity} />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold mb-1.5 sm:mb-2"
                    style={{
                      fontSize: "clamp(12px, 2.5vw, 14px)",
                      color: "#FFFFFF",
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
                      color: "rgba(255, 255, 255, 0.5)",
                      lineHeight: "1.5",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <code
                      className="rounded font-mono"
                      style={{
                        padding: "3px 6px",
                        background: "rgba(255, 255, 255, 0.05)",
                        fontSize: "10px",
                        color: "rgba(255, 255, 255, 0.4)",
                        wordBreak: "break-all",
                      }}
                    >
                      {alert.component}
                    </code>
                    <button
                      className="font-medium hover:underline"
                      style={{ fontSize: "11px", color: "#A78BFA", cursor: "pointer" }}
                      onClick={() => setViewingError(alert)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>

                {/* Desktop Timestamp */}
                <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" style={{ color: "rgba(255, 255, 255, 0.3)" }} />
                  <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>
                    {alert.timestamp_relative}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <button
        className="w-full rounded-lg sm:rounded-xl font-medium transition-all"
        style={{
          padding: "clamp(10px, 2vw, 14px)",
          background: "rgba(139, 92, 246, 0.1)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
          fontSize: "clamp(12px, 2.5vw, 13px)",
          color: "#A78BFA",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"; }}
      >
        View All Errors &amp; Logs
      </button>

      {/* View Details Modal */}
      {viewingError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setViewingError(null); }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl"
            style={{
              background: "#1a0b2e",
              border: "1px solid rgba(255,255,255,0.12)",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between"
              style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const { bg, border: bd, color } = severityBadgeStyle(viewingError.severity);
                  return (
                    <span
                      className="rounded-full font-semibold capitalize"
                      style={{ padding: "4px 10px", background: bg, border: bd, fontSize: "11px", color }}
                    >
                      {viewingError.severity}
                    </span>
                  );
                })()}
                <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                  Error Details
                </span>
              </div>
              <button
                onClick={() => setViewingError(null)}
                className="rounded-full flex items-center justify-center transition-colors"
                style={{
                  width: "28px",
                  height: "28px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >
                <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              {/* Title */}
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", lineHeight: "1.3" }}>
                {viewingError.title}
              </h2>

              {/* Component + Timestamp */}
              <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: "16px" }}>
                <code
                  className="rounded font-mono"
                  style={{
                    padding: "4px 8px",
                    background: "rgba(255,255,255,0.07)",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {viewingError.component}
                </code>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                  {viewingError.timestamp_relative}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "20px" }}>
                {viewingError.description}
              </p>

              {/* Divider */}
              <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "20px" }} />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: "20px" }}>
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Error Type</div>
                  <div style={{ fontSize: "13px", color: "#E2D4F0", fontWeight: 500, wordBreak: "break-all" }}>{viewingError.details.error_type}</div>
                </div>
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Affected Requests</div>
                  <div style={{ fontSize: "13px", color: "#E2D4F0", fontWeight: 500 }}>{viewingError.details.affected_requests}</div>
                </div>
                {viewingError.details.duration_ms != null && (
                  <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Duration</div>
                    <div style={{ fontSize: "13px", color: "#E2D4F0", fontWeight: 500 }}>{viewingError.details.duration_ms}ms</div>
                  </div>
                )}
              </div>

              {/* Context */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Context
                </div>
                <pre
                  style={{
                    padding: "14px",
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px",
                    fontSize: "11px",
                    color: "#A5F3FC",
                    fontFamily: "monospace",
                    overflowX: "auto",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {JSON.stringify(viewingError.details.context, null, 2)}
                </pre>
              </div>

              {/* Resolution */}
              {viewingError.details.resolution && (
                <div
                  className="flex gap-3"
                  style={{
                    padding: "14px",
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    borderRadius: "10px",
                  }}
                >
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#FCD34D" }} />
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: "1.6" }}>
                    {viewingError.details.resolution}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
