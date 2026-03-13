"use client";

import { motion } from "framer-motion";

export default function Design17Construction() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-[#1c1917] px-6 py-16">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(251,191,36,0.03) 2px,
            rgba(251,191,36,0.03) 4px
          )`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center rounded-lg border-2 border-amber-700/50 bg-amber-950/30 px-10 py-12 md:px-14"
      >
        <span className="text-4xl" aria-hidden>
          🚧
        </span>
        <h1 className="mt-4 text-2xl font-bold uppercase tracking-wider text-amber-200 md:text-3xl">
          Under construction
        </h1>
        <p className="mt-2 text-sm text-amber-200/70">Pricing · Coming soon</p>
        <p className="mt-6 max-w-xs text-center text-sm text-amber-200/60">
          We're building plans that scale with every stage of growth.
        </p>
        <a
          href="/contact"
          className="mt-8 rounded border border-amber-600/60 bg-amber-800/30 px-5 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-700/40"
        >
          Get notified
        </a>
      </motion.div>
    </main>
  );
}
