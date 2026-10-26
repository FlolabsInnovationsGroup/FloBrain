"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function LeadershipPreviewHeader() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="fb-v2-preview-header">
      <div className="fb-v2-preview-header-inner">
        <span className="text-base font-semibold tracking-tight">FloBrain</span>
        <div className="flex items-center gap-4">
          <span className="fb-v2-leadership-label">Leadership</span>
          <button
            type="button"
            className="fb-v2-btn-ghost inline-flex items-center gap-2"
            aria-label="Toggle light and dark theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun size={16} className="hidden dark:block" aria-hidden="true" />
            <Moon size={16} className="dark:hidden" aria-hidden="true" />
            Theme
          </button>
        </div>
      </div>
    </header>
  );
}
