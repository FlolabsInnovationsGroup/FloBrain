"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Clock } from "lucide-react";

interface WorkflowAlert {
  id: number;
  severity: "critical" | "warning";
  title: string;
  description: string;
  component: string;
  timestamp: string;
}

const workflowEngineData = {
  alerts: [
    {
      id: 1,
      severity: "critical" as const,
      title: "Sentiment Analysis - API rate limit exceeded",
      description: "OpenAI API rate limit reached. Requests throttled for 14 minutes.",
      component: "sentiment-analysis:v2",
      timestamp: "2 min ago",
    },
    {
      id: 2,
      severity: "critical" as const,
      title: "Memory Retrieval Timeout",
      description: "Vector database query exceeded 30s timeout threshold.",
      component: "memory-engine",
      timestamp: "19 min ago",
    },
    {
      id: 3,
      severity: "warning" as const,
      title: "High Memory Usage Detected",
      description: "Workflow 'user-context-builder' consuming 647MB. Consider optimization.",
      component: "user-context-builder",
      timestamp: "1 hour ago",
    },
    {
      id: 4,
      severity: "critical" as const,
      title: "Failed Webhook Delivery",
      description: "Unable to deliver completion event to endpoint: https://api.client.com/events",
      component: "webhook-dispatcher",
      timestamp: "3 hours ago",
    },
    {
      id: 5,
      severity: "warning" as const,
      title: "Model Version Deprecated",
      description: "GPT-4-0314 will be deprecated on June 13. Migrate to gpt-4-turbo.",
      component: "llm-router",
      timestamp: "5 hours ago",
    },
  ],
};

export const WorkflowEngine = (): React.JSX.Element => {
  const { alerts } = workflowEngineData;

  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = alerts.filter((alert) => alert.severity === "warning").length;

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
      {/* Header Section */}
      <div className="grid grid-cols-[1fr_auto] items-start gap-3 sm:flex sm:items-start sm:justify-between sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2
            className="font-semibold mb-1"
            style={{
              fontSize: "11px",
              letterSpacing: "0.5px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            WORKFLOW ENGINE
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            Recent errors & warnings
          </p>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-0 sm:flex sm:items-center sm:gap-2">
          <div
            className="inline-flex w-fit justify-self-start rounded-full font-semibold"
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
            className="inline-flex w-fit justify-self-start rounded-full font-semibold"
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
                      style={{
                        width: "24px",
                        height: "24px",
                        background: "rgba(220, 38, 38, 0.2)",
                      }}
                    >
                      <AlertCircle className="w-4 h-4" style={{ color: "#FCA5A5" }} />
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
                      <AlertTriangle className="w-4 h-4" style={{ color: "#FCD34D" }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" style={{ color: "rgba(255, 255, 255, 0.3)" }} />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {alert.timestamp}
                  </span>
                </div>
              </div>

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
                    <AlertCircle className="w-4 h-4" style={{ color: "#FCA5A5" }} />
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
                    <AlertTriangle className="w-4 h-4" style={{ color: "#FCD34D" }} />
                  </div>
                )}
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

                {/* Tag + Link */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
                  <button
                    className="font-medium hover:underline"
                    style={{
                      fontSize: "11px",
                      color: "#A78BFA",
                      cursor: "pointer",
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>

              {/* Desktop Timestamp */}
              <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                <Clock className="w-3.5 h-3.5" style={{ color: "rgba(255, 255, 255, 0.3)" }} />
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {alert.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
