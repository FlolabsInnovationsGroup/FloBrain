"use client";

import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Set authentication flag when user accesses authenticated routes
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isAuthenticated", "true");
    }
  }, []);

  return (
    <>
      {/* Navbar removed from here because it's now in the root layout */}
      <main className="flex-1">{children}</main>
    </>
  );
}
