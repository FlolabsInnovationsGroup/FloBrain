"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function useMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div
        className="h-9 w-[4.25rem] shrink-0 rounded-full bg-white/5"
        aria-hidden
      />
    );
  }

  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-[4.25rem] shrink-0 items-center rounded-full border border-white/10 bg-white/5 p-1 transition-colors hover:bg-white/10"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span
        className={`absolute top-1 left-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#9333ea] shadow-md transition-transform duration-200 ${
          isDark ? "translate-x-0" : "translate-x-[1.85rem]"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-white" aria-hidden />
        ) : (
          <Sun className="h-3.5 w-3.5 text-white" aria-hidden />
        )}
      </span>
      <Sun
        className={`ml-1.5 h-3.5 w-3.5 transition-opacity ${isDark ? "opacity-40" : "opacity-0"}`}
        aria-hidden
      />
      <Moon
        className={`mr-1.5 ml-auto h-3.5 w-3.5 transition-opacity ${isDark ? "opacity-0" : "opacity-40"}`}
        aria-hidden
      />
    </button>
  );
}
