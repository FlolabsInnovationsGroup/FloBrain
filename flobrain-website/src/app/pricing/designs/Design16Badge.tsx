"use client";

import { motion } from "framer-motion";

export default function Design16Badge() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-[#1a1a2e] px-6 py-16">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative"
      >
        <div className="rounded-full border-4 border-amber-400/80 bg-amber-500/20 px-12 py-8 md:px-16 md:py-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.5em] text-amber-400/90">
            Pricing
          </p>
          <p className="mt-2 text-center text-4xl font-black uppercase tracking-wider text-amber-100 md:text-5xl">
            Soon
          </p>
        </div>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500/30 text-xs font-bold text-amber-200">
          !
        </div>
      </motion.div>
      <p className="mt-10 max-w-sm text-center text-sm text-zinc-500">
        Plans that scale with you. Get in touch to be first to know.
      </p>
      <a
        href="/contact"
        className="mt-6 rounded-full border border-amber-500/50 bg-amber-500/10 px-6 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-500/20"
      >
        Get notified
      </a>
    </main>
  );
}
