"use client";

import { motion } from "framer-motion";

export default function Design20Brutalist() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-zinc-100 px-6 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl border-4 border-black bg-white p-8 md:p-12"
      >
        <h1 className="text-5xl font-black uppercase leading-none text-black md:text-6xl">
          Pricing
        </h1>
        <h2 className="mt-6 text-3xl font-black uppercase text-black md:text-4xl">
          Coming soon
        </h2>
        <p className="mt-8 text-zinc-600">
          We're putting together plans that scale with every stage of growth.
        </p>
        <a
          href="/contact"
          className="mt-10 inline-block border-4 border-black bg-black px-6 py-3 text-sm font-bold uppercase text-white transition-colors hover:bg-zinc-800"
        >
          Get notified
        </a>
      </motion.div>
    </main>
  );
}
