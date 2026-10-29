"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, MessageCircle, Pause, Play, Search, Video } from "lucide-react";
import type { IconType } from "react-icons";
import { SiCanva, SiClickup, SiFigma, SiGithub, SiMiro } from "react-icons/si";

export type ChatGroup = {
  heading: string;
  items: string[];
};

export type Buddy = {
  id: string;
  name: string;
  /** CSS color value, ideally a `var(--fb-v2-buddy-*)` token */
  color: string;
};

type RailApp = {
  name: string;
  icon: IconType;
  color: string;
  /** Render the icon white on a filled circle of `color` instead of as a bare glyph */
  badge?: boolean;
};

export const defaultChatGroups: ChatGroup[] = [
  {
    heading: "GROUPS",
    items: ["Admin", "Finance", "Executive"],
  },
  {
    heading: "TEAMS",
    items: [
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
    ],
  },
];

export const defaultBuddies: Buddy[] = Array.from({ length: 9 }, (_, index) => ({
  id: `buddy-${index + 1}`,
  name: `AI Buddy ${index + 1}`,
  color: `var(--fb-v2-buddy-${index + 1})`,
}));

const railApps: RailApp[] = [
  { name: "Figma", icon: SiFigma, color: "var(--fb-v2-rail-figma)" },
  { name: "Canva", icon: SiCanva, color: "var(--fb-v2-rail-canva)", badge: true },
  { name: "GitHub", icon: SiGithub, color: "var(--fb-v2-rail-github)", badge: true },
  { name: "ClickUp", icon: SiClickup, color: "var(--fb-v2-rail-clickup)", badge: true },
  { name: "Miro", icon: SiMiro, color: "var(--fb-v2-rail-miro)", badge: true },
];

const meetingMenus = ["Meeting Links", "Recordings", "Transcripts"];

export function AppRail() {
  return (
    <aside className="fb-lead-rail hidden w-10 shrink-0 flex-col items-center gap-4 rounded-md py-4 lg:flex">
      {railApps.map(({ name, icon: Icon, color, badge }) => (
        <button
          key={name}
          type="button"
          aria-label={`Open ${name}`}
          title={name}
          className="flex h-5 w-5 items-center justify-center rounded-full transition hover:scale-110"
          style={badge ? { background: color, color: "#ffffff" } : { color }}
        >
          <Icon size={badge ? 11 : 15} />
        </button>
      ))}
    </aside>
  );
}

type MeetingsPanelProps = {
  chatGroups?: ChatGroup[];
  activeRoom?: string;
  onSelectRoom?: (room: string) => void;
  onSettings?: () => void;
  onSignOut?: () => void;
};

export function MeetingsPanel({
  chatGroups = defaultChatGroups,
  activeRoom,
  onSelectRoom,
  onSettings,
  onSignOut,
}: MeetingsPanelProps) {
  const [roomSearch, setRoomSearch] = useState("");

  const visibleGroups = useMemo(() => {
    const query = roomSearch.trim().toLowerCase();
    if (!query) return chatGroups;

    return chatGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.toLowerCase().includes(query)),
      }))
      .filter((group) => group.items.length > 0);
  }, [chatGroups, roomSearch]);

  return (
    <aside className="hidden min-h-0 w-[clamp(230px,21vw,320px)] shrink-0 flex-col gap-2 overflow-hidden lg:flex">
      <section className="fb-lead-meetings shrink-0 rounded-md px-4 pb-3 pt-5">
        <div className="flex items-center justify-center gap-5">
          <Video size={20} className="fill-current" />
          <h2 className="text-lg font-medium tracking-wide">MEETINGS</h2>
        </div>

        <div className="mt-7 flex justify-between gap-2 text-[10px]">
          {meetingMenus.map((item) => (
            <button
              key={item}
              type="button"
              className="fb-lead-link-hover flex items-center gap-0.5"
            >
              {item}
              <ChevronDown size={12} />
            </button>
          ))}
        </div>
      </section>

      <section className="fb-lead-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-md">
        <div className="shrink-0 px-3 pb-1 pt-3">
          <h2 className="text-lg">Chat Rooms</h2>
          <p className="fb-lead-muted text-[11px]">Channels, Groups and DM’s</p>
        </div>

        <div className="shrink-0 px-2 py-2">
          <label className="fb-lead-input flex items-center gap-2 rounded-md px-2 py-1.5">
            <Search size={15} className="shrink-0 opacity-50" />
            <input
              type="search"
              value={roomSearch}
              onChange={(event) => setRoomSearch(event.target.value)}
              placeholder="Search Rooms"
              aria-label="Search chat rooms"
              className="w-full min-w-0 bg-transparent text-xs outline-none"
            />
          </label>
        </div>

        <nav
          aria-label="Chat rooms"
          className="fb-lead-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-2"
        >
          {visibleGroups.map((group) => (
            <div key={group.heading} className="mb-5">
              <h3 className="mb-1 text-sm font-medium">{group.heading}</h3>

              <ul className="space-y-0.5 pl-3">
                {group.items.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => onSelectRoom?.(item)}
                      aria-current={activeRoom === item ? "page" : undefined}
                      className={`fb-lead-link-hover block w-full truncate text-left text-sm leading-5 ${
                        activeRoom === item ? "fb-lead-room-active" : ""
                      }`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {visibleGroups.length === 0 && (
            <p className="fb-lead-muted py-4 text-center text-xs">No rooms match “{roomSearch}”.</p>
          )}

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium">DIRECT MESSAGES</h3>
            <div className="space-y-3">
              <MessageCircle size={22} className="fb-lead-dm" />
              <MessageCircle size={22} className="fb-lead-dm" />
            </div>
          </div>
        </nav>

        <div className="fb-lead-divider shrink-0 border-t px-8 py-3">
          <button type="button" onClick={onSettings} className="fb-lead-link-hover block text-sm">
            Settings
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="fb-lead-signout mt-1 block text-sm hover:opacity-80"
          >
            Sign Out
          </button>
        </div>
      </section>
    </aside>
  );
}

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function SessionTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  return (
    <div className="fb-lead-timer flex h-16 items-center justify-center gap-4 rounded-md">
      <span className="text-xs font-medium tabular-nums" aria-live="off">
        {formatElapsed(elapsed)}
      </span>
      <div
        aria-hidden
        className={`fb-lead-timer-ring h-9 w-9 rounded-full ${running ? "animate-spin [animation-duration-[3s]]" : ""}`}
      />
      <button
        type="button"
        onClick={() => setRunning((value) => !value)}
        aria-label={running ? "Pause timer" : "Start timer"}
        className="transition hover:scale-110"
      >
        {running ? (
          <Pause size={22} className="fb-lead-timer-play" />
        ) : (
          <Play size={22} className="fb-lead-timer-play" />
        )}
      </button>
    </div>
  );
}

type BuddiesPanelProps = {
  buddies?: Buddy[];
  activeBuddyId?: string;
  onSelectBuddy?: (buddy: Buddy) => void;
};

export function BuddiesPanel({
  buddies = defaultBuddies,
  activeBuddyId,
  onSelectBuddy,
}: BuddiesPanelProps) {
  return (
    <aside className="fb-lead-buddies hidden min-h-0 w-[clamp(200px,18vw,280px)] shrink-0 flex-col overflow-hidden rounded-md lg:flex">
      <div className="shrink-0 px-3 pt-6">
        <SessionTimer />
      </div>

      <div className="fb-lead-divider mt-8 shrink-0 border-b pb-1 text-center">
        <h2 className="text-lg font-bold">Buddies - AI Agents</h2>
      </div>
      <p className="shrink-0 py-2 text-center text-xs">Tap a Buddy to route chat.</p>

      <div className="fb-lead-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 pb-4 pt-4">
        {buddies.map((buddy) => (
          <button
            key={buddy.id}
            type="button"
            onClick={() => onSelectBuddy?.(buddy)}
            aria-pressed={activeBuddyId === buddy.id}
            aria-label={buddy.name}
            title={buddy.name}
            className="fb-lead-buddy block h-10 w-full rounded-md"
            style={{ "--fb-buddy-color": buddy.color } as CSSProperties}
          />
        ))}
      </div>
    </aside>
  );
}

type SidePanelsLayoutProps = MeetingsPanelProps &
  BuddiesPanelProps & {
    children: ReactNode;
  };

/** Rail + Meetings/Chat Rooms on the left, Buddies on the right, page content in between. */
export default function SidePanelsLayout({
  children,
  chatGroups,
  activeRoom,
  onSelectRoom,
  onSettings,
  onSignOut,
  buddies,
  activeBuddyId,
  onSelectBuddy,
}: SidePanelsLayoutProps) {
  return (
    <div className="fb-lead-shell flex h-[calc(100dvh-var(--fb-navbar-h))] min-h-[560px] w-full gap-3 overflow-hidden p-3">
      <AppRail />
      <MeetingsPanel
        chatGroups={chatGroups}
        activeRoom={activeRoom}
        onSelectRoom={onSelectRoom}
        onSettings={onSettings}
        onSignOut={onSignOut}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      <BuddiesPanel buddies={buddies} activeBuddyId={activeBuddyId} onSelectBuddy={onSelectBuddy} />
    </div>
  );
}
