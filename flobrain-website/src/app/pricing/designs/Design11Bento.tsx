"use client";

import { motion } from "framer-motion";

export default function Design11Bento() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-[#0c0c0e] p-6 md:p-10">
      <div className="grid w-full max-w-2xl grid-cols-4 grid-rows-3 gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 row-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex flex-col justify-end"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Pricing</p>
          <p className="mt-2 text-2xl font-semibold text-white md:text-3xl">Coming soon</p>
          <a href="/contact" className="mt-4 text-sm text-violet-400 hover:underline">
            Get notified →
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-violet-500/30 bg-violet-950/30 p-4 flex items-center justify-center"
        >
          <span className="text-3xl font-bold text-violet-400">Soon</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-center"
        >
          <p className="text-sm text-zinc-500">Plans in the works</p>
        </motion.div>
      </div>
    </main>
  );
}
