"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import FlolabsLogo from "@/assets/images/flolabs-logo.svg";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navIconClass = "size-4 shrink-0";

const activeLinkClass =
  "bg-white/10 text-white ring-1 ring-[#a855f7]/50";
const inactiveLinkClass = "text-zinc-400 hover:text-white";

const AUTHED_NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Chat", href: "/brain", icon: MessageCircle },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
] as const;

function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isMemoryRoute = pathname === "/memory" || pathname.startsWith("/memory/");
  const isDashboardRoute = pathname === "/dashboard";
  const isHomeActive = pathname === "/";

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
      <nav
        className="pointer-events-auto relative mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-3 py-2.5 backdrop-blur-md sm:px-5 sm:py-3 md:px-6 md:py-3.5"
        style={{
          background: "var(--fb-navbar-bg)",
          borderColor: "var(--fb-navbar-border)",
          boxShadow: "0 8px 32px rgba(147, 51, 234, 0.18)",
        }}
      >
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
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex lg:items-center lg:gap-1">
          {!isLoading && isAuthenticated ? (
            <div className="flex items-center gap-1">
              {AUTHED_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const isActive = isNavItemActive(href, pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? activeLinkClass : inactiveLinkClass
                      }`}
                  >
                    <Icon className={navIconClass} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isHomeActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <Home className={navIconClass} />
                Home
              </Link>
              {/* <Link
                href="/pricing"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isPricingActive ? activeLinkClass : inactiveLinkClass
                  }`}
              >
                <DollarSign className={navIconClass} />
                Pricing
              </Link>
              <Link
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

        {/* RIGHT: Theme toggle + auth */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <div className="hidden lg:flex lg:items-center lg:gap-4">
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
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:text-white lg:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="pointer-events-auto mx-auto mt-2 max-w-6xl rounded-2xl border p-3 shadow-lg sm:p-4 lg:hidden"
          style={{
            background: "var(--fb-navbar-bg)",
            borderColor: "var(--fb-navbar-border)",
          }}
        >
          {!isLoading && isAuthenticated ? (
            <div className="flex flex-col gap-2">
              {AUTHED_NAV_ITEMS.map(({ label, href }) => {
                const isActive = isNavItemActive(href, pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-lg px-2 py-2.5 ${isActive ? "font-medium text-white" : "text-zinc-300"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link href="/profile" className="rounded-lg px-2 py-2.5 text-zinc-300" onClick={() => setIsOpen(false)}>Profile</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                  className={`rounded-lg px-2 py-2.5 ${
                    isHomeActive ? "font-medium text-white" : "text-zinc-300"
                }`}
                onClick={() => setIsOpen(false)}
            >
              Home
              </Link>

              <Link
                href="/signin"
                className="rounded-lg px-2 py-2.5 text-zinc-300"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-[#9333ea] py-3 text-center text-white"
                onClick={() => setIsOpen(false)}
            >
                Register
              </Link>
            </div>
      )}
        </div>
      )}
    </header>
  );
}
