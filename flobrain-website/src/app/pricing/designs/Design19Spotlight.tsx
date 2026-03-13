"use client";

import { motion } from "framer-motion";

export default function Design19Spotlight() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-black px-6 py-16">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, transparent 0%, transparent 50%, black 100%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div
          className="absolute -inset-20 rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)",
          }}
        />
        <h1 className="relative text-4xl font-bold text-white md:text-5xl">Pricing</h1>
        <p className="relative mt-4 text-2xl font-medium text-zinc-400">Coming soon</p>
        <p className="relative mt-6 max-w-sm text-sm text-zinc-500">
          Plans that scale with you. Stay tuned.
        </p>
        <a
          href="/contact"
          className="relative mt-10 rounded-full border border-zinc-600 bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Get notified
        </a>
      </motion.div>
    </main>
  );
}
