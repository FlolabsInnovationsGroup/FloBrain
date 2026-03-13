"use client";

import { motion } from "framer-motion";

export default function Design18Layers() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-[#0f0f12] px-6 py-20">
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute rounded-2xl border border-zinc-800 bg-zinc-900/80 px-12 py-8 shadow-2xl"
          style={{ transform: "translateY(0) rotate(-2deg)" }}
        >
          <p className="text-center text-lg font-semibold text-white">Coming soon</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute rounded-2xl border border-zinc-700 bg-zinc-800/90 px-14 py-10 shadow-xl"
          style={{ transform: "translateY(0) rotate(1deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 rounded-2xl border border-violet-500/40 bg-zinc-900 px-16 py-12 shadow-2xl"
        >
          <h1 className="text-center text-2xl font-bold text-white">Pricing</h1>
          <p className="mt-4 text-center text-violet-400">Plans in the works</p>
          <a
            href="/contact"
            className="mt-8 block text-center text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            Get notified
          </a>
        </motion.div>
      </div>
    </main>
  );
}
