"use client";

import { motion } from "framer-motion";

export default function Design15MinimalLine() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-white px-6 py-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="h-px w-24 bg-zinc-300" />
        <p className="mt-8 text-sm font-medium tracking-[0.4em] text-zinc-400">PRICING</p>
        <p className="mt-4 text-3xl font-light text-zinc-800 md:text-4xl">Coming soon</p>
        <div className="mt-8 h-px w-24 bg-zinc-300" />
        <a
          href="/contact"
          className="mt-10 text-xs font-medium uppercase tracking-widest text-zinc-500 hover:text-zinc-800"
        >
          Get notified
        </a>
      </motion.div>
    </main>
  );
}
