"use client";

import { motion } from "framer-motion";

export default function Design08SplitScreen() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] overflow-hidden">
      <motion.div
        initial={{ width: "50%" }}
        animate={{ width: "50%" }}
        className="relative flex flex-col justify-center bg-[#0f0f12] px-10 py-16 md:px-16"
      >
        <div className="mx-auto w-full max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">FloBrain</p>
          <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">Pricing</h1>
          <p className="mt-6 text-lg text-zinc-400">Coming soon.</p>
          <p className="mt-4 text-sm text-zinc-500">
            We're putting together plans that scale with every stage of growth.
          </p>
          <a
            href="/contact"
            className="mt-10 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Get notified
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative flex-1 bg-gradient-to-br from-violet-600/20 via-purple-900/30 to-indigo-950/50"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[clamp(3rem,8vw,6rem)] font-black uppercase tracking-[0.2em] text-white/10">
            Soon
          </span>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 left-6 text-[10px] uppercase tracking-widest text-zinc-600">
        Design 08 — Split
      </div>
    </main>
  );
}
