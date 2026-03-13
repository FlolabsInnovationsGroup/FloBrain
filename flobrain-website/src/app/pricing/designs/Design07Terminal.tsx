"use client";

import { motion } from "framer-motion";

export default function Design07Terminal() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-[#0d1117] px-6 py-16">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl rounded-lg border border-emerald-900/50 bg-[#161b22] font-mono text-sm shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-emerald-900/40 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/60" />
            <span className="h-3 w-3 rounded-full bg-rose-500/60" />
            <span className="ml-4 text-xs text-zinc-500">~/pricing</span>
          </div>
          <div className="p-6">
            <p className="text-emerald-400">$ cat pricing.json</p>
            <p className="mt-2 text-zinc-500">{`{`}</p>
            <p className="pl-4 text-zinc-400">"status": <span className="text-amber-400">"coming_soon"</span>,</p>
            <p className="pl-4 text-zinc-400">"message": <span className="text-emerald-400">"Plans in the works. Stay tuned."</span></p>
            <p className="text-zinc-500">{`}`}</p>
            <p className="mt-6 flex items-center gap-2 text-emerald-400">
              <span className="inline-block h-4 w-0.5 animate-pulse bg-emerald-400" />
              _
            </p>
          </div>
        </motion.div>

        <a
          href="/contact"
          className="mt-8 font-mono text-xs text-emerald-500/80 underline hover:text-emerald-400"
        >
          Get notified
        </a>
      </div>
    </main>
  );
}
