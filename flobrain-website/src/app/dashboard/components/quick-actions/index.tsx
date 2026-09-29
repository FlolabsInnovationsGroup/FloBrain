"use client";

import Link from "next/link";
import { Plus, Brain, Activity } from "lucide-react";

const actions = [
  { label: "New Workflow", href: "/dashboard", icon: Plus },
  { label: "Open Brain", href: "/brain", icon: Brain },
  { label: "System Status", href: "/dashboard#health", icon: Activity },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-purple-500/50 transition-all text-sm font-medium"
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
    </div>
  );
}
