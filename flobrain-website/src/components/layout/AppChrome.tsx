"use client";

import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { isV2ShellRoute } from "@/components/v2/navigation";
import { usePathname } from "next/navigation";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isV2 = isV2ShellRoute(pathname);

  if (isV2) {
    return (
      <div className="min-h-screen flex flex-col fb-v2-page">
        <Navbar />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col fb-page">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
