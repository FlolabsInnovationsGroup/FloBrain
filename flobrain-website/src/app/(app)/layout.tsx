"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Dark background for home so there's no strip below the navbar */
const HOME_PAGE_BG = "bg-[#020617]";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/home";
  const isBrain = pathname === "/brain";

  // Set authentication flag when user accesses authenticated routes
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isAuthenticated", "true");
    }
  }, []);

  const backgroundClass = isHome ? HOME_PAGE_BG : "";

  return (
    <>
      {/* Navbar removed from here because it's now in the root layout */}
      <main className={`flex-1 min-h-full ${isBrain ? "h-full" : ""} ${backgroundClass}`}>{children}</main>
    </>
  );
}
