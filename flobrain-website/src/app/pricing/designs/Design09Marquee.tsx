"use client";

import { motion } from "framer-motion";

const repeat = "Coming soon · Pricing · FloBrain · ".repeat(8);

export default function Design09Marquee() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-[#0a0a0b] px-6 py-20">
      <div className="absolute inset-0 flex flex-col justify-center overflow-hidden">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex w-max gap-8 whitespace-nowrap text-4xl font-bold tracking-tight text-zinc-800 md:text-5xl"
        >
          <span>{repeat}</span>
          <span>{repeat}</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-xl text-center"
      >
        <h1 className="text-4xl font-bold text-white md:text-5xl">Pricing</h1>
        <p className="mt-6 text-lg text-zinc-400">
          We're putting together plans that scale with you. Stay tuned.
        </p>
        <a
          href="/contact"
          className="mt-10 inline-block rounded-full border border-zinc-600 bg-zinc-900/80 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-zinc-500"
        >
          Get notified
        </a>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-zinc-600">
        Design 09 — Marquee
      </div>
    </main>
  );
}
