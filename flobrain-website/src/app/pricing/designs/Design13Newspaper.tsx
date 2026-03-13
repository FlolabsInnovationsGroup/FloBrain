"use client";

import { motion } from "framer-motion";

export default function Design13Newspaper() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-[#f5f0e8] px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl border-b-4 border-black pb-2"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
          FloBrain · Pricing
        </p>
        <h1 className="mt-2 font-serif text-5xl font-black leading-tight text-black md:text-6xl">
          COMING SOON
        </h1>
        <p className="mt-4 font-serif text-lg text-zinc-700">
          Plans that scale with every stage of growth. Stay tuned for our launch.
        </p>
        <a
          href="/contact"
          className="mt-8 inline-block border-b-2 border-black pb-1 font-serif text-sm font-semibold text-black hover:opacity-70"
        >
          Get notified when we launch
        </a>
      </motion.div>
    </main>
  );
}
