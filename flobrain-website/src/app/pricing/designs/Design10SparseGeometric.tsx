"use client";

import { motion } from "framer-motion";

export default function Design10SparseGeometric() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-[#070708] px-8 py-24">
      <div className="absolute left-1/2 top-1/2 h-[1px] w-[80vw] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-[80vmin] w-[1px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="mb-12 h-16 w-px bg-zinc-500" />
        <h1 className="text-2xl font-medium tracking-[0.4em] text-zinc-400">PRICING</h1>
        <p className="mt-6 text-5xl font-light tracking-wide text-white md:text-6xl">Coming soon</p>
        <div className="mt-12 h-16 w-px bg-zinc-500" />
        <p className="mt-8 max-w-xs text-xs tracking-widest text-zinc-500">
          Plans that scale with every stage of growth.
        </p>
        <a
          href="/contact"
          className="mt-12 text-xs font-medium uppercase tracking-[0.3em] text-zinc-500 underline underline-offset-4 hover:text-zinc-400"
        >
          Get notified
        </a>
      </motion.div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-zinc-700">
        Design 10 — Sparse geometric
      </div>
    </main>
  );
}
