"use client";

import React from "react";
import { Activity, Server } from "lucide-react";

const systemHealthData = {
  brainStatus: "Online",
  allSystemsOperational: true,
  connectedDevices: 12,
};

export const SystemHealth = (): React.JSX.Element => {
  const { brainStatus, allSystemsOperational, connectedDevices } = systemHealthData;

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
      {/* Top Section */}
      <div className="flex items-start justify-between mb-5 sm:mb-8">
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
            Last updated: Just now
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
              color: "#FFFFFF",
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

      {/* Bottom Section */}
      <div className="mb-3 sm:mb-5">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Server className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "rgba(255, 255, 255, 0.4)" }} />
            <span
              className="font-medium"
              style={{
                fontSize: "clamp(12px, 2.5vw, 15px)",
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              Connected Devices
            </span>
          </div>
          <div
            className="font-bold"
            style={{
              fontSize: "clamp(24px, 5vw, 35px)",
              color: "#FFFFFF",
              lineHeight: "1",
            }}
          >
            {connectedDevices}
          </div>
        </div>

        {/* Device Indicators Row */}
        <div className="flex gap-1 sm:gap-2">
          {Array.from({ length: connectedDevices }).map((_, index) => (
            <div
              key={index}
              className="flex-1 rounded"
              style={{
                height: "7px",
                background: "linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
