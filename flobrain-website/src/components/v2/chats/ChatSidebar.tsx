"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  CircleHelp,
  Hand,
  LayoutGrid,
  MessageCircle,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { mockChatUser, mockRecentChats } from "./mockChats";
import "./ChatViews.css";

const NAV_ITEMS = [
  { label: "Chats", href: "/chats", icon: MessageCircle },
  { label: "Team rooms", href: "/chats/rooms", icon: Users },
  { label: "Quick prompts", href: "/chats/prompts", icon: LayoutGrid },
] as const;

/**
 * Matches the frames: on /chats only "New chat" is highlighted; "Chats" is active
 * for saved chats and document chats.
 */
export function isChatNavActive(href: string, pathname: string): boolean {
  if (href === "/chats") {
    return (
      pathname.startsWith("/chats/") &&
      !pathname.startsWith("/chats/rooms") &&
      !pathname.startsWith("/chats/prompts")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ChatSidebar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const recent = normalized
    ? mockRecentChats.filter((chat) => chat.title.toLowerCase().includes(normalized))
    : mockRecentChats;

  return (
    <div className="fb-v2-chat-sidebar">
      <Link href="/chats" className="fb-v2-chat-brand">
        <Hand size={20} aria-hidden="true" />
        FloBrain
      </Link>

      <nav className="fb-v2-chat-nav" aria-label="Chat">
        <Link
          href="/chats"
          className="fb-v2-chat-nav-link fb-v2-chat-new"
          aria-current={pathname === "/chats" ? "page" : undefined}
        >
          <Plus size={16} aria-hidden="true" />
          New chat
        </Link>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="fb-v2-chat-nav-link"
            aria-current={isChatNavActive(href, pathname) ? "page" : undefined}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      <hr className="fb-v2-chat-rule" />

      <section aria-labelledby="fb-v2-chat-recent-label">
        <p id="fb-v2-chat-recent-label" className="fb-v2-chat-eyebrow">
          Recent chats
        </p>
        <ul className="fb-v2-chat-recent">
          {recent.map((chat) => (
            <li key={chat.id}>
              <Link
                href={`/chats/${chat.id}`}
                className="fb-v2-chat-nav-link"
                aria-current={pathname === `/chats/${chat.id}` ? "page" : undefined}
              >
                {chat.title}
              </Link>
            </li>
          ))}
          {recent.length === 0 ? <li className="fb-v2-chat-eyebrow">No chats match</li> : null}
        </ul>
      </section>

      <label className="fb-v2-chat-search">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Search chats</span>
        <input
          type="search"
          placeholder="Search chats"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="fb-v2-chat-sidebar-footer">
        <button type="button" className="fb-v2-chat-nav-link">
          <CircleHelp size={16} aria-hidden="true" />
          Help &amp; shortcuts
        </button>
        <div className="fb-v2-chat-profile">
          <div>
            <p className="fb-v2-chat-profile-name">{mockChatUser.name}</p>
            <p className="fb-v2-chat-profile-plan">{mockChatUser.plan}</p>
          </div>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
