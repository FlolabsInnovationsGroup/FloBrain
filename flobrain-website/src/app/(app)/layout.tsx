"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Same as Home (Brain) page background so there's no purple strip below the navbar */
const HOME_PAGE_BG = "bg-[#020617]";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBrainHome = pathname === "/home";

  // Set authentication flag when user accesses authenticated routes
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isAuthenticated", "true");
    }
  }, []);

  return (
    <>
      {/* Navbar removed from here because it's now in the root layout */}
      <main className={`flex-1 min-h-full ${isBrainHome ? HOME_PAGE_BG : ""}`}>{children}</main>
    </>
  );
}
