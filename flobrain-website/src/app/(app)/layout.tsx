"use client";

import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isAuthenticated", "true");
    }
  }, []);

  return <main className="flex-1 min-h-full fb-page">{children}</main>;
}
