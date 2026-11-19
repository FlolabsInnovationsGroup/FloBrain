"use client";

import { CalendarDays, MessageSquare, Users, MessageCircle, Settings, LogOut } from "lucide-react";

const sidebarSections = [
  {
    title: "COMMUNICATION",
    items: [
      { label: "Meetings", icon: CalendarDays },
      { label: "Chat Rooms", icon: MessageSquare },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      { label: "Groups / Teams", icon: Users },
      { label: "Direct Messages", icon: MessageCircle },
    ],
  },
];

export function ProjectLeftPanel() {
  return (
    <div className="flex h-full min-h-[600px] flex-col p-4" style={{ color: "var(--fb-v2-text)" }}>
      <div className="mb-8 flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold"
          style={{
            background: "var(--fb-v2-accent)",
            color: "var(--fb-v2-on-accent)",
          }}
        >
          F
        </div>

        <span className="text-lg font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
          FloBrain
        </span>
      </div>

      <nav className="flex-1 space-y-7" aria-label="Workspace navigation">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <p
              className="mb-3 px-2 text-[10px] font-semibold tracking-wider"
              style={{ color: "var(--fb-v2-text-subtle)" }}
            >
              {section.title}
            </p>

            <ul className="space-y-1">
              {section.items.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <div
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                    style={{ color: "var(--fb-v2-text-muted)" }}
                  >
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    {label}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t pt-4" style={{ borderColor: "var(--fb-v2-border)" }}>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
          <Settings size={18} strokeWidth={1.8} aria-hidden="true" />
          Settings
        </div>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
          <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
          Sign Out
        </div>
      </div>
    </div>
  );
}
