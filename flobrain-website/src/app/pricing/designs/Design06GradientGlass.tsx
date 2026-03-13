"use client";

import { motion } from "framer-motion";

export default function Design06GradientGlass() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-violet-950/60 to-fuchsia-950/80" />
      <div
        className="absolute left-1/2 top-1/3 h-[50vmax] w-[50vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 right-1/4 h-[30vmax] w-[30vmax] rounded-full bg-fuchsia-500/15 blur-[80px]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-xl md:p-12"
      >
        <h1 className="text-center text-3xl font-semibold text-white md:text-4xl">Pricing</h1>
        <p className="mt-6 text-center text-lg font-medium text-white/90">Coming soon</p>
        <p className="mt-4 text-center text-sm text-white/60">
          We're crafting plans that scale with every stage of growth. Stay tuned.
        </p>
        <div className="mt-10 flex justify-center">
          <a
            href="/contact"
            className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Get notified
          </a>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/30">
        Design 06 — Gradient glass
      </div>
    </main>
  );
}
