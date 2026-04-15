"use client";

import React, { memo, useCallback, useId, useMemo, useState, type SubmitEventHandler } from "react";
import {
  Search,
  Plus,
  Brain,
  Database,
  Router,
  Activity,
  SlidersHorizontal,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatHistory } from "@/types/chat";

const EMPTY_CHAT_HISTORY: ChatHistory[] = [];

export type SystemModuleId = "brain-activity" | "load-memory" | "router-config" | "system-health";

export const SYSTEM_MODULE_IDS: SystemModuleId[] = [
  "brain-activity",
  "load-memory",
  "router-config",
  "system-health",
];

const MODULES: ReadonlyArray<{
  id: SystemModuleId;
  label: string;
  icon: LucideIcon;
  /** Show status dot (e.g. for "Brain Activity" active indicator) */
  showDot?: boolean;
}> = [
  { id: "brain-activity", label: "Brain Activity", icon: Brain, showDot: true },
  { id: "load-memory", label: "Load Memory", icon: Database },
  { id: "router-config", label: "Router Configuration", icon: Router },
  { id: "system-health", label: "System Health", icon: Activity },
];

export type LeftPanelVariant = "modules" | "chats";

export interface LeftPanelPropsBase {
  variant: LeftPanelVariant;
  onNewChat?: () => void;
  onSearch?: (query: string) => void;
  onPreferences?: () => void;
  onSettings?: () => void;
}

export interface LeftPanelPropsModules extends LeftPanelPropsBase {
  variant: "modules";
  activeModuleId: SystemModuleId;
  onModuleSelect: (id: SystemModuleId) => void;
}

export interface LeftPanelPropsChats extends LeftPanelPropsBase {
  variant: "chats";
  chatHistory?: ChatHistory[];
  currentChatId?: number | null;
  onLoadChat?: (id: number) => void;
  chatsLoading?: boolean;
}

export type LeftPanelProps = LeftPanelPropsModules | LeftPanelPropsChats;

/** @deprecated Use LeftPanelPropsModules for modules variant */
export interface LeftPanelPropsLegacy {
  activeModuleId: SystemModuleId;
  onModuleSelect: (id: SystemModuleId) => void;
  onNewChat?: () => void;
  onSearch?: (query: string) => void;
  onPreferences?: () => void;
  onSettings?: () => void;
}

const LeftPanel = memo(function LeftPanel(props: LeftPanelProps) {
  const { variant, onNewChat, onSearch, onPreferences, onSettings } = props;
  const searchId = useId();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch?.(value);
    },
    [onSearch]
  );
  const handleSearchSubmit: SubmitEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.querySelector<HTMLInputElement>('input[type="search"]');
      if (input) onSearch?.(input.value);
    },
    [onSearch]
  );

  const isModules = variant === "modules";
  const isChats = variant === "chats";
  const activeModuleId = isModules ? props.activeModuleId : undefined;
  const onModuleSelect = isModules ? props.onModuleSelect : undefined;
  const chatHistory = isChats ? (props.chatHistory ?? EMPTY_CHAT_HISTORY) : EMPTY_CHAT_HISTORY;
  const currentChatId = isChats ? (props.currentChatId ?? null) : null;
  const onLoadChat = isChats ? props.onLoadChat : undefined;
  const chatsLoading = isChats ? (props.chatsLoading ?? false) : false;

  const filteredChats = useMemo(() => {
    if (!isChats || !searchQuery.trim()) return chatHistory;
    const q = searchQuery.trim().toLowerCase();
    return chatHistory.filter((c) => c.title.toLowerCase().includes(q));
  }, [isChats, chatHistory, searchQuery]);

  const searchPlaceholder = isChats ? "Search chats..." : "Search ...";

  return (
    <div
      className="flex flex-col bg-[#0B0719]/50 relative w-[20%] border-transparent rounded-xl"
    >
      <div
        className={cn(
          "flex flex-col flex-1 min-h-0 p-4 gap-4",
        )}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="shrink-0">
          <label htmlFor={searchId} className="sr-only">
            Search
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden
            />
            <input
              id={searchId}
              type="search"
              placeholder={searchPlaceholder}
              value={isChats ? searchQuery : undefined}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-3.5 rounded-lg bg-[#0F172B]/80 text-[#62748E] border border-[#1D293D]/50 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </form>

        {/* New Chat */}
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-between gap-2 rounded-lg bg-black border border-white/36 py-3 px-4 mb-6 text-white text-xs font-semibold tracking-wider hover:bg-slate-900 hover:border-slate-700 transition-all shrink-0"
        >
          <span>NEW CHAT</span>
          <Plus className="w-6 h-6 shrink-0" aria-hidden />
        </button>

        {/* Middle: System Modules (with icons) or All Chats (text only) */}
        {isModules && activeModuleId !== undefined && onModuleSelect && (
          <div className="flex flex-col gap-1 shrink-0">
            <h2 className="text-[12px] uppercase tracking-[0.2em] text-[#90A1B9] font-bold px-1 mb-3">
              SYSTEM MODULES
            </h2>
            <nav className="flex flex-col gap-0.5" aria-label="System modules">
              {MODULES.map(({ id, label, icon: Icon, showDot }) => {
                const isActive = activeModuleId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onModuleSelect(id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg py-2.5 px-3 text-left text-sm text-[#CAD5E2] transition-all",
                      isActive
                        ? "bg-[#000000]/80 border border-[#AD46FF]/30 shadow-[0_0_32px_rgba(126,34,206,0.4)] text-white"
                        : "cursor-pointer border border-transparent hover:bg-white/5 hover:border-white/5"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-white" : "text-[#CAD5E2]"
                    )} />
                    <span>{label}</span>
                    {showDot && isActive && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#AD46FF] shrink-0"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {isChats && (
          <div className="flex flex-col gap-1 shrink-0 min-h-0 flex-1 flex">
            <h2 className="text-[12px] uppercase tracking-[0.2em] text-[#90A1B9] font-bold px-1 mb-3">
              All Chats
            </h2>
            <nav className="flex flex-col gap-0.5 overflow-y-auto min-h-0" aria-label="Chat list">
              {chatsLoading && (
                <p className="text-[#62748E] text-sm py-2 px-3">Loading chats...</p>
              )}
              {!chatsLoading && filteredChats.length === 0 && (
                <p className="text-[#62748E] text-sm py-2 px-3">No chats yet</p>
              )}
              {!chatsLoading &&
                filteredChats.map((chat) => {
                  const isActive = currentChatId === chat.id;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => onLoadChat?.(chat.id)}
                      className={cn(
                        "w-full rounded-lg py-2.5 px-3 text-left text-sm transition-all border border-transparent",
                        isActive
                          ? "bg-[#000000]/80 border-[#AD46FF]/30 shadow-[0_0_32px_rgba(126,34,206,0.4)] text-white"
                          : "text-[#CAD5E2] hover:bg-white/5 hover:border-white/5"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="block truncate">{chat.title}</span>
                    </button>
                  );
                })}
            </nav>
          </div>
        )}

        {/* Spacer so footer stays at bottom (modules only; chats uses flex-1 above) */}
        {isModules && <div className="flex-1" />}

        {/* Footer: status + preferences + settings */}
        <div className="pt-4 border-t border-slate-700/80 space-y-3 shrink-0">
          <div className="flex items-center gap-2 px-2 border border-[#32D583]/45 bg-[#10B981]/10 rounded-full w-fit">
            <span
              className="w-2 h-2 rounded-full bg-[#32D583]/45 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
              aria-hidden
            />
            <span className="text-[11px] uppercase tracking-wider font-medium text-[#32D583]/45 px-2 py-1">
              System Online
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPreferences}
              className="group flex-1 flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm text-[#CAD5E2] bg-[#0F172B]/80 border border-[#1D293D]/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7F56D9]/60 hover:bg-[#1B1235] hover:text-white hover:shadow-[0_10px_24px_rgba(127,86,217,0.25)]"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0 transition-colors group-hover:text-[#C4B5FD]" aria-hidden />
              <span className="text-[#CAD5E2]">Preferences</span>
            </button>
            <button
              type="button"
              onClick={onSettings}
              className="shrink-0 p-2 rounded-lg text-[#CAD5E2] bg-[#0F172B]/80 border border-[#1D293D]/50 hover:bg-[#0F172B]/90 transition-all"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export { LeftPanel };
