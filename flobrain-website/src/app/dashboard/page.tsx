"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import FlolabsLogo from "@/assets/images/flolabs-logo.svg";
import { SystemHealth } from "./components/system-health";
import { TokenUsage } from "./components/token-usage";
import { MemoryActivity } from "./components/memory-activity";
import { WorkflowEngine } from "./components/workflow-engine";

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <main
      className="min-h-screen text-white px-4 pt-6 pb-24 sm:px-6 sm:pt-8 sm:pb-28 md:p-8"
      style={{ background: "linear-gradient(116.21deg, #290036 -1.81%, #070014 100%)" }}
    >
      <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Image src={FlolabsLogo} alt="FloBrain" className="h-8 w-auto" priority />
              <div>
                <p className="text-2xl font-semibold tracking-tight text-white">FloBrain</p>
                <p className="text-xs text-zinc-400">v1 • AI Operating System</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Open dashboard menu"
              className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center"
            >
              {isMenuOpen ? <X className="h-5 w-5 text-zinc-200" /> : <Menu className="h-5 w-5 text-zinc-200" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="mb-5 rounded-2xl border border-white/10 bg-[#140522]/95 p-4 shadow-lg">
              {!isLoading && isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link href="/home" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Home
                  </Link>
                  <Link href="/dashboard" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/brain" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Chats
                  </Link>
                  <Link href="/memory" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Memory
                  </Link>
                  <Link href="/profile" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/home" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Home
                  </Link>
                  <Link href="/pricing" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Pricing
                  </Link>
                  <Link href="/contact" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Contact
                  </Link>
                  <Link href="/signin" className="rounded-lg py-2 text-zinc-200" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="mt-1 rounded-xl bg-[#9333ea] py-2.5 text-center text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="h-11 rounded-full border border-[#7c3aed]/40 bg-[#2a0b4a]/75 px-4 flex items-center gap-2 mb-5">
            <Search className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Search</span>
          </div>

          <h1 className="w-1/2 whitespace-nowrap text-[24px] leading-[1.1] font-semibold tracking-tight mb-1">
            System Dashboard
          </h1>
          <p className="text-xs" style={{ color: "#C4B4FF" }}>
            Real-time monitoring and analytics for FloBrain AI OS
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <h1 className="text-4xl font-bold mb-2">SYSTEM DASHBOARD</h1>
          <p className="text-zinc-400 text-base">
            Monitor your system health, workflows, and AI model performance
          </p>
        </div>

        {/* Top Section - System Health & Token Usage */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <SystemHealth />
          <TokenUsage />
        </div>

        {/* Memory Activity Section */}
        <div className="mb-4 sm:mb-6">
          <MemoryActivity />
        </div>

        {/* Workflow Engine Section */}
        <WorkflowEngine />
      </div>
    </main>
  );
}
