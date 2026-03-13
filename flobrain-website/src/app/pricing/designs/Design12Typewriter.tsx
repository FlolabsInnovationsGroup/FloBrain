"use client";

import { motion } from "framer-motion";

export default function Design12Typewriter() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-[#111113] px-6 py-16">
      <div className="font-mono text-lg text-zinc-300 md:text-xl">
        <span className="text-emerald-500">&gt;</span>{" "}
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-emerald-500 pr-1"
        >
          Pricing: Coming soon
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.2 }}
        >
          _
        </motion.span>
      </div>
      <p className="mt-8 max-w-sm text-center text-sm text-zinc-500">
        We're putting together plans that scale with you.
      </p>
      <a
        href="/contact"
        className="mt-8 font-mono text-sm text-emerald-500 hover:underline"
      >
        Get notified
      </a>
    </main>
  );
}
