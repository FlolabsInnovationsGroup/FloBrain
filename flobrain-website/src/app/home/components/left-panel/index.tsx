"use client";

import React, { memo, useCallback, useId, useMemo, useState, type SubmitEventHandler } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Brain,
  Database,
  Activity,
  SlidersHorizontal,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatHistory } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";

const EMPTY_CHAT_HISTORY: ChatHistory[] = [];

export type SystemModuleId = "brain-activity" | "load-memory" | "system-health";

export const SYSTEM_MODULE_IDS: SystemModuleId[] = [
  "brain-activity",
  "load-memory",
  "system-health",
];

const MODULES: ReadonlyArray<{
  id: SystemModuleId;
  label: string;
  icon: LucideIcon;
  href: string;
  /** Show status dot (e.g. for "Brain Activity" active indicator) */
  showDot?: boolean;
}> = [
  { id: "brain-activity", label: "Brain Activity", icon: Brain, href: "/home", showDot: true },
  { id: "load-memory", label: "Load Memory", icon: Database, href: "/memory" },
  { id: "system-health", label: "System Health", icon: Activity, href: "/dashboard" },
];

function isModuleActive(href: string, pathname: string): boolean {
  if (href === "/home") return pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type LeftPanelVariant = "modules" | "chats";

export interface LeftPanelPropsBase {
  variant: LeftPanelVariant;
  onNewChat?: () => void;
  onSearch?: (query: string) => void;
  onPreferences?: () => void;
  onSettings?: () => void;
  /** Merged onto the root panel; use e.g. `w-full md:w-[20%]` when the parent sets width (drawers). */
  className?: string;
}

export interface LeftPanelPropsModules extends LeftPanelPropsBase {
  variant: "modules";
}

export interface LeftPanelPropsChats extends LeftPanelPropsBase {
  variant: "chats";
  chatHistory?: ChatHistory[];
  currentChatId?: number | null;
  onLoadChat?: (id: number) => void;
  chatsLoading?: boolean;
}

export type LeftPanelProps = LeftPanelPropsModules | LeftPanelPropsChats;

const LeftPanel = memo(function LeftPanel(props: LeftPanelProps) {
  const { variant, onNewChat, onSearch, onPreferences, onSettings, className } = props;
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
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
  const _chatHistory = isChats ? (props.chatHistory ?? EMPTY_CHAT_HISTORY) : EMPTY_CHAT_HISTORY;
  const currentChatId = isChats ? (props.currentChatId ?? null) : null;
  const onLoadChat = isChats ? props.onLoadChat : undefined;
  const chatsLoading = isChats ? (props.chatsLoading ?? false) : false;
  const chats = useMemo(() => {
    if (!isChats) return [];
    const chatProps = props as LeftPanelPropsChats;
    return chatProps.chatHistory ?? [];
  }, [isChats, props]);

  const filteredChats = useMemo(() => {
    if (!isChats || !searchQuery.trim()) return chats;
    const q = searchQuery.trim().toLowerCase();
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [isChats, chats, searchQuery]);

  const searchPlaceholder = isChats ? "Search chats..." : "Search ...";
  const visibleModules = !isLoading && isAuthenticated
    ? MODULES
    : MODULES.filter(({ href }) => href === "/home");

  return (
    <div
      className={cn(
        "fb-brain-sidebar flex flex-col relative w-[20%] min-h-0 border-transparent rounded-xl",
        className
      )}
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
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fb-brain-text-subtle)] pointer-events-none"
              aria-hidden
            />
            <input
              id={searchId}
              type="search"
              placeholder={searchPlaceholder}
              value={isChats ? searchQuery : undefined}
              onChange={handleSearchChange}
              className="fb-brain-input w-full pl-9 pr-3 py-3.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--fb-brain-btn)]/30 focus:border-[var(--fb-brain-btn)]/50"
              style={{
                background: 'var(--fb-brain-sidebar-search-bg)',
                borderColor: 'var(--fb-brain-sidebar-search-border)',
                color: 'var(--fb-brain-text)',
              }}
            />
          </div>
        </form>

        {/* New Chat */}
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-between gap-2 rounded-lg border py-3 px-4 mb-6 text-xs font-semibold tracking-wider transition-colors shrink-0 hover:opacity-90"
          style={{
            background: 'var(--fb-brain-new-chat-bg)',
            borderColor: 'var(--fb-brain-new-chat-border)',
            color: 'var(--fb-brain-new-chat-text)',
          }}
        >
          <span>NEW CHAT</span>
          <Plus className="w-6 h-6 shrink-0" aria-hidden />
        </button>

        {/* Middle: System Modules (with icons) or All Chats (text only) */}
        {isModules && (
          <div className="flex flex-col gap-1 shrink-0">
            <h2 className="text-[12px] uppercase tracking-[0.2em] font-bold px-1 mb-3 text-[var(--fb-brain-sidebar-section-label)]">
              SYSTEM MODULES
            </h2>
            <nav className="flex flex-col gap-0.5" aria-label="System modules">
              {visibleModules.map(({ id, label, icon: Icon, href, showDot }) => {
                const isActive = isModuleActive(href, pathname);
                return (
                  <Link
                    key={id}
                    href={href}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg py-2.5 px-3 text-left text-sm transition-colors",
                      isActive
                        ? "text-[var(--fb-brain-nav-active-text)] ring-1"
                        : "cursor-pointer border border-transparent text-[var(--fb-brain-sidebar-item-text)] hover:bg-[var(--fb-brain-surface-bg)] hover:border-[var(--fb-brain-surface-border)]"
                    )}
                    style={
                      isActive
                        ? {
                            background: 'var(--fb-brain-nav-active-bg)',
                            boxShadow: 'inset 0 0 0 1px var(--fb-brain-nav-active-ring)',
                          }
                        : undefined
                    }
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-[var(--fb-brain-nav-active-text)]" : "text-[var(--fb-brain-sidebar-item-text)]"
                    )} />
                    <span>{label}</span>
                    {showDot && isActive && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0 bg-[var(--fb-brain-accent)]"
                        aria-hidden
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {isChats && (
          <div className="flex flex-col gap-1 shrink-0 min-h-0 flex-1 flex">
            <h2 className="text-[12px] uppercase tracking-[0.2em] font-bold px-1 mb-3 text-[var(--fb-brain-sidebar-section-label)]">
              All Chats
            </h2>
            <nav className="flex flex-col gap-0.5 overflow-y-auto min-h-0" aria-label="Chat list">
              {chatsLoading && (
                <p className="text-[var(--fb-brain-sidebar-search-text)] text-sm py-2 px-3">Loading chats...</p>
              )}
              {!chatsLoading && filteredChats.length === 0 && (
                <p className="text-[var(--fb-brain-sidebar-search-text)] text-sm py-2 px-3">No chats yet</p>
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
                        "w-full rounded-lg py-2.5 px-3 text-left text-sm transition-colors border border-transparent",
                        isActive
                          ? "text-[var(--fb-brain-nav-active-text)] ring-1"
                          : "text-[var(--fb-brain-sidebar-item-text)] hover:bg-[var(--fb-brain-surface-bg)] hover:border-[var(--fb-brain-surface-border)]"
                      )}
                      style={
                        isActive
                          ? {
                              background: 'var(--fb-brain-nav-active-bg)',
                              boxShadow: 'inset 0 0 0 1px var(--fb-brain-nav-active-ring)',
                            }
                          : undefined
                      }
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
        <div className="pt-4 border-t space-y-3 shrink-0" style={{ borderColor: 'var(--fb-brain-sidebar-footer-border)' }}>
          <div className="flex items-center gap-2 px-2 border rounded-full w-fit" style={{ borderColor: 'rgba(52, 211, 153, 0.45)', background: 'rgba(16, 185, 129, 0.1)' }}>
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: 'var(--fb-brain-success)', boxShadow: '0 0 6px rgba(52, 211, 153, 0.6)' }}
              aria-hidden
            />
            <span className="text-[11px] uppercase tracking-wider font-medium px-2 py-1" style={{ color: 'var(--fb-brain-success)' }}>
              System Online
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPreferences}
              className="group flex-1 flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm border transition-all duration-200 hover:-translate-y-0.5 text-[var(--fb-brain-sidebar-item-text)] hover:text-[var(--fb-brain-heading)]"
              style={{
                background: 'var(--fb-brain-sidebar-search-bg)',
                borderColor: 'var(--fb-brain-sidebar-search-border)',
              }}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0 transition-colors group-hover:text-[var(--fb-brain-accent)]" aria-hidden />
              <span>Preferences</span>
            </button>
            <button
              type="button"
              onClick={onSettings}
              className="shrink-0 p-2 rounded-lg border transition-all text-[var(--fb-brain-sidebar-item-text)] hover:text-[var(--fb-brain-heading)]"
              style={{
                background: 'var(--fb-brain-sidebar-search-bg)',
                borderColor: 'var(--fb-brain-sidebar-search-border)',
              }}
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
