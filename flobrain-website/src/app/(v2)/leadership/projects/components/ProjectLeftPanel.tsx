"use client";

import { useState } from "react";
import {
  CalendarDays,
  Video,
  FileText,
  MessageSquare,
  Search,
  MessageCircle,
  Settings,
  LogOut,
  LayoutDashboard,
  CircleHelp,
  Bot,
  Folder,
} from "lucide-react";

const groups = ["Admin", "Finance", "Executive"];

const teams = [
  "Humanoid - general",
  "Flo-Brain front end",
  "Flo-Brain backend",
  "AI & Robotics Team",
  "Automation Team",
  "Analytics Team",
  "Design Team",
  "Space Team",
  "Legal Team",
  "Moodchanger Team",
  "Development Team",
];

export function ProjectLeftPanel() {
  const [search, setSearch] = useState("");

  const filteredGroups = groups.filter((item) => item.toLowerCase().includes(search.toLowerCase()));

  const filteredTeams = teams.filter((item) => item.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-full min-h-[600px] gap-2 p-2" style={{ color: "var(--fb-v2-text)" }}>
      {/* Narrow icon rail */}
      <div
        className="flex w-8 shrink-0 flex-col items-center gap-4 rounded-md py-3"
        style={{ background: "var(--fb-v2-page-bg)" }}
      >
        {[Bot, CircleHelp, LayoutDashboard, Folder, MessageCircle].map((Icon, index) => (
          <Icon
            key={index}
            size={16}
            strokeWidth={2}
            style={{ color: "var(--fb-v2-accent)" }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Main sidebar */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Meetings */}
        <section
          className="mb-2 rounded-lg p-3"
          style={{
            background: "var(--fb-v2-surface)",
            border: "1px solid var(--fb-v2-border)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold"
              style={{
                background: "var(--fb-v2-accent)",
                color: "var(--fb-v2-on-accent)",
              }}
            >
              F
            </div>
            <span className="text-sm font-semibold">FloBrain</span>
          </div>

          <p
            className="mb-2 text-[9px] font-semibold"
            style={{ color: "var(--fb-v2-text-subtle)" }}
          >
            COMMUNICATION
          </p>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="flex items-center gap-1">
              <CalendarDays size={12} /> Meetings
            </span>
            <span className="flex items-center gap-1">
              <Video size={12} /> Recordings
            </span>
            <span className="flex items-center gap-1">
              <FileText size={12} /> Transcripts
            </span>
          </div>
        </section>

        {/* Chat rooms */}
        <section
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg"
          style={{
            background: "var(--fb-v2-surface)",
            border: "1px solid var(--fb-v2-border)",
          }}
        >
          <div className="border-b p-2" style={{ borderColor: "var(--fb-v2-border)" }}>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MessageSquare size={15} />
              Chat Rooms
            </div>

            <label
              className="flex items-center gap-2 rounded-md border px-2 py-1.5"
              style={{ borderColor: "var(--fb-v2-border)" }}
            >
              <Search size={12} style={{ color: "var(--fb-v2-text-subtle)" }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Rooms"
                aria-label="Search groups and teams"
                className="w-full min-w-0 bg-transparent text-[10px] outline-none"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2 text-[10px]">
            <p className="mb-1 font-semibold">GROUPS</p>
            <ul className="mb-4 space-y-0.5 pl-3">
              {filteredGroups.map((group) => (
                <li key={group}>{group}</li>
              ))}
            </ul>

            <p className="mb-1 font-semibold">TEAMS</p>
            <ul className="space-y-0.5 pl-3">
              {filteredTeams.map((team) => (
                <li key={team}>{team}</li>
              ))}
            </ul>

            {filteredGroups.length === 0 && filteredTeams.length === 0 && (
              <p style={{ color: "var(--fb-v2-text-subtle)" }}>No matching rooms</p>
            )}

            <p className="mb-2 mt-6 font-semibold">DIRECT MESSAGES</p>
            <div className="flex gap-3 pl-1">
              <MessageCircle size={16} style={{ color: "var(--fb-v2-accent)" }} />
              <MessageCircle size={16} style={{ color: "var(--fb-v2-accent)" }} />
            </div>
          </div>

          {/* Bottom actions */}
          <div
            className="space-y-2 border-t p-3 text-xs"
            style={{ borderColor: "var(--fb-v2-border)" }}
          >
            <div className="flex items-center gap-2">
              <Settings size={14} /> Settings
            </div>
            <div className="flex items-center gap-2">
              <LogOut size={14} /> Sign Out
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
