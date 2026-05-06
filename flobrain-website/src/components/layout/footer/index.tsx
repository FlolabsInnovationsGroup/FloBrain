"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Linkedin, Twitter, Instagram, House, LayoutDashboard, MessageCircle, Database } from "lucide-react";
import {
  FOOTER_BRAND,
  FOOTER_SECTIONS,
  FOOTER_SOCIAL,
  FOOTER_MARKETING_PATHS,
} from "./constants";

const footerLinkBase =
  "text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer";

const SOCIAL_ICONS = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
} as const;

const MOBILE_APP_NAV_ITEMS = [
  { label: "Home", href: "/home", icon: House },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chats", href: "/brain", icon: MessageCircle },
  { label: "Memory", href: "/memory", icon: Database },
] as const;

export default function Footer() {
  const pathname = usePathname();
  const showFooter = FOOTER_MARKETING_PATHS.some((p) => pathname === p);
  const showMobileAppNav = MOBILE_APP_NAV_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  if (!showFooter && !showMobileAppNav) return null;

  return (
    <>
      {showMobileAppNav && (
        <nav className="fixed inset-x-0 bottom-0 z-[110] border-t border-[#ffffff1a] bg-[#4A1872] md:hidden">
          <ul className="grid grid-cols-4 items-center px-3 py-2">
            {MOBILE_APP_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex flex-col items-center justify-center gap-1.5 py-1"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-[#A78BFA]" : "text-[#9C89BB]"}`} />
                    <span className={`text-xs ${isActive ? "text-[#A78BFA]" : "text-[#9C89BB]"}`}>{label}</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#C4B4FF]" : "bg-transparent"}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {showFooter && (
        <footer className="mt-3 md:mt-24 border-t border-white/5 bg-[#020617]">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6 md:py-12">
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                {FOOTER_BRAND}
              </p>
            </div>

            <div className="grid flex-1 gap-8 text-left text-sm text-zinc-400 sm:grid-cols-2 md:grid-cols-4">
              {FOOTER_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {section.title}
                  </p>
                  <ul className="space-y-2">
                    {section.links.map(({ label, href }) => (
                      <li key={label}>
                        <Link href={href} className={footerLinkBase}>
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Follow Us
                </p>
                <div className="flex items-center gap-3">
                  {FOOTER_SOCIAL.map(({ href, label, icon, hoverClass }) => {
                    const Icon = SOCIAL_ICONS[icon];
                    return (
                      <Link
                        key={icon}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors ${hoverClass}`}
                      >
                        <Icon className="size-4" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
