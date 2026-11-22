"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { mockNotifications } from "./mockNotifications";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-zinc-500 text-sm">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors ${
                    !n.read ? "bg-purple-500/5" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {!n.read && (
                      <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-purple-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{n.title}</p>
                      <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-zinc-500 text-xs mt-1">{n.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block p-3 text-center text-sm text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors border-t border-zinc-800"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
