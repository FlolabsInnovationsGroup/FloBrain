"use client";

import { motion } from "framer-motion";

export default function Design04Neon() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-[#0c0c0f] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(124,58,237,0.08),transparent)]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <p className="mb-6 text-sm uppercase tracking-[0.5em] text-violet-400/70">Pricing</p>
        <h1
          className="text-5xl font-bold tracking-[0.2em] text-violet-300 sm:text-6xl md:text-7xl"
          style={{
            textShadow:
              "0 0 20px rgba(196,181,253,0.6), 0 0 40px rgba(139,92,246,0.4), 0 0 60px rgba(124,58,237,0.2)",
          }}
        >
          COMING SOON
        </h1>
        <div
          className="mx-auto mt-4 h-px w-32 rounded-full bg-violet-500/60"
          style={{ boxShadow: "0 0 20px rgba(139,92,246,0.8)" }}
        />
        <p className="mt-8 max-w-sm text-zinc-500">
          Something exciting is on the way. Stay tuned for plans that scale with you.
        </p>
        <a
          href="/contact"
          className="mt-10 inline-block rounded border border-violet-500/50 bg-violet-500/10 px-6 py-3 text-sm font-medium text-violet-300 transition-all hover:border-violet-400 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          Get notified
        </a>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-zinc-600">
        Design 04 — Neon
      </div>
    </main>
  );
}
