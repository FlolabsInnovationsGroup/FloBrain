"use client";

import { motion } from "framer-motion";

export default function Design14GlowOrb() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-[#050508] px-6 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div
          className="absolute inset-0 -m-20 rounded-full opacity-40 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)",
          }}
        />
        <div className="relative rounded-full border border-violet-500/30 bg-violet-950/40 px-16 py-12 backdrop-blur-sm md:px-20 md:py-16">
          <h1 className="text-center text-2xl font-semibold text-white md:text-3xl">Pricing</h1>
          <p className="mt-3 text-center text-lg font-medium text-violet-300">Coming soon</p>
          <p className="mt-6 max-w-xs text-center text-sm text-zinc-500">
            Plans in the works. Stay tuned.
          </p>
          <a
            href="/contact"
            className="mt-8 block text-center text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            Get notified
          </a>
        </div>
      </motion.div>
    </main>
  );
}
