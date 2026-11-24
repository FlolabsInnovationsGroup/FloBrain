"use client";

import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { isV2ShellRoute } from "@/components/v2/navigation";
import { usePathname } from "next/navigation";

function isAuthScreen(pathname: string): boolean {
  return (
    pathname === "/signin" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  );
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isV2 = isV2ShellRoute(pathname);

  if (isV2) {
    return <div className="min-h-screen flex flex-col fb-v2-page">{children}</div>;
  }

  if (isAuthScreen(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col fb-page">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
