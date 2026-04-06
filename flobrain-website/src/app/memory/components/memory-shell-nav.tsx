"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, LayoutGrid, MessageCircle, Database } from "lucide-react";
import FlolabsLogo from "@/assets/images/flolabs-logo.svg";

const navBtn =
  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors md:px-4";

export function MemoryShellNav() {
  return (
    <header className="flex shrink-0 flex-col gap-4 border-b border-white/[0.06] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
      <Link href="/home" className="flex min-w-0 shrink-0 items-center gap-3">
        <Image src={FlolabsLogo} alt="FloBrain" className="h-8 w-auto" priority />
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-white">FloBrain</span>
          <span className="text-xs text-zinc-500">v1 • AI Operating System</span>
        </div>
      </Link>

      <nav className="flex flex-wrap items-center gap-1 md:gap-2">
        <Link
          href="/home"
          className={`${navBtn} text-zinc-400 hover:text-white`}
        >
          <Home className="size-4 shrink-0" />
          Home
        </Link>
        <Link href="/dashboard" className={`${navBtn} text-zinc-400 hover:text-white`}>
          <LayoutGrid className="size-4 shrink-0" />
          Dashboard
        </Link>
        <Link href="/brain" className={`${navBtn} text-zinc-400 hover:text-white`}>
          <MessageCircle className="size-4 shrink-0" />
          Chats
        </Link>
        <span
          className={`${navBtn} cursor-default bg-[#7B5CFF]/18 text-white ring-1 ring-[#7B5CFF]/35`}
          aria-current="page"
        >
          <Database className="size-4 shrink-0 text-[#7B5CFF]" />
          Memory
        </span>
      </nav>
    </header>
  );
}
