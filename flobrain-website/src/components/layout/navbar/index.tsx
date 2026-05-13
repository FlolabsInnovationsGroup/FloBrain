"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, DollarSign } from "lucide-react";
import FlolabsLogo from "@/assets/images/flolabs-logo.svg";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const navIconClass = "size-4 shrink-0";

const activeLinkClass =
  "bg-white/10 text-white ring-1 ring-[#a855f7]/50";
const inactiveLinkClass = "text-zinc-400 hover:text-white";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isMemoryRoute = pathname === "/memory" || pathname.startsWith("/memory/");
  const isDashboardRoute = pathname === "/dashboard";
  const isHomeActive = pathname === "/" || pathname === "/home";
  const isPricingActive = pathname === "/pricing";

  return (
    <header
      className={
        isDashboardRoute
          ? "hidden md:block"
          : isMemoryRoute
          ? "pointer-events-none fixed inset-x-0 top-0 z-[100] px-4 pt-4 md:px-6 md:pt-5"
          : "sticky top-0 z-[100] px-4 pt-4 md:px-6 md:pt-5"
      }
    >
      <nav className="pointer-events-auto relative mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/5 bg-[#0f0a1a]/95 px-3 py-2.5 shadow-[0_8px_32px_rgba(147,51,234,0.18)] backdrop-blur-md sm:px-5 sm:py-3 md:px-6 md:py-3.5">
        {/* LEFT: Logo + Brand + Tagline */}
        <div className="flex min-w-0 shrink items-center gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Image
              src={FlolabsLogo}
              alt="FloBrain"
              className="h-7 w-auto text-[#a855f7] sm:h-8"
              priority
            />
            <div className="flex min-w-0 flex-col">
              <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
                FloBrain
              </span>
              <span className="text-[10px] leading-tight text-zinc-500 sm:text-xs">
                v1 • AI Operating System
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Nav links (desktop) — truly centered */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:items-center md:gap-1">
          {!isLoading && isAuthenticated ? (
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isHomeActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <Home className={navIconClass} />
                Home
              </Link>
              {/* <Link
                href="/dashboard"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isDashboardActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <LayoutDashboard className={navIconClass} />
                Dashboard
              </Link>
              <Link
                href="/brain"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isChatsActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <MessageCircle className={navIconClass} />
                Chats
              </Link>
              <Link
                href="/memory"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isMemoryActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <Brain className={navIconClass} />
                Memory
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
              >
                Profile
              </Link>*/}
            </div> 
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isHomeActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <Home className={navIconClass} />
                Home
              </Link>
              <Link
                href="/pricing"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isPricingActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <DollarSign className={navIconClass} />
                Pricing
              </Link>
              {/* <Link
                href="/contact"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isContactActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <Mail className={navIconClass} />
                Contact
              </Link> */}
            </div>
          )}
        </div>

        {/* RIGHT: Auth actions */}
         <div className="flex shrink-0 items-center gap-4">
        {/*  <div className="hidden md:flex md:items-center md:gap-4">
            {isLoading ? (
              <span className="text-sm text-zinc-500">…</span>
            ) : !isAuthenticated ? (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-white hover:text-white/90"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-[#9333ea] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-colors hover:bg-[#a855f7]"
                >
                  Register
                </Link>
              </>
            ) : null}
          </div>*/}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:text-white md:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-6xl rounded-2xl border border-white/5 bg-[#0f0a1a]/95 p-3 shadow-lg sm:p-4 md:hidden">
          {!isLoading && isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className={`rounded-lg px-2 py-2.5 ${isHomeActive ? "font-medium text-white" : "text-zinc-300"}`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              {/* <Link href="/dashboard" className="rounded-lg px-2 py-2.5 text-zinc-300" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link href="/brain" className="rounded-lg px-2 py-2.5 text-zinc-300" onClick={() => setIsOpen(false)}>Chats</Link>
              <Link href="/memory" className="rounded-lg px-2 py-2.5 text-zinc-300" onClick={() => setIsOpen(false)}>Memory</Link>
              <Link href="/profile" className="rounded-lg px-2 py-2.5 text-zinc-300" onClick={() => setIsOpen(false)}>Profile</Link> */}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className={`rounded-lg px-2 py-2.5 ${isHomeActive ? "font-medium text-white" : "text-zinc-300"}`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className={`rounded-lg px-2 py-2.5 ${isPricingActive ? "font-medium text-white" : "text-zinc-300"}`}
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              {/* <Link
                href="/contact"
                className={`rounded-lg px-2 py-2.5 ${isContactActive ? "font-medium text-white" : "text-zinc-300"}`}
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <Link href="/signin" className="rounded-lg px-2 py-2.5 text-zinc-300" onClick={() => setIsOpen(false)}>Sign In</Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#9333ea] py-3 text-center text-white"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link> */}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
