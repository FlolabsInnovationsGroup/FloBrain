"use client";

import { motion } from "framer-motion";

const PAPER_PATTERN =
  "url('data:image/svg+xml," +
  encodeURIComponent(
    '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.02"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>'
  ) +
  "')";

export default function Design05PaperCard() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-[#1a1814] px-6 py-16">
      <div
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: PAPER_PATTERN }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-lg border border-amber-900/50 bg-[#2a2620] p-10 shadow-2xl shadow-black/40">
          <div className="border-b border-amber-800/40 pb-6">
            <h1 className="text-2xl font-semibold text-amber-100">Pricing</h1>
            <p className="mt-2 text-sm text-amber-200/70">FloBrain plans for every stage of growth</p>
          </div>
          <div className="flex flex-col items-center py-12">
            <div
              className="rotate-[-6deg] rounded border-2 border-rose-600 bg-rose-700 px-8 py-4 font-mono text-xl font-bold tracking-wider text-white shadow-lg"
              style={{ fontFamily: "ui-monospace, monospace" }}
            >
              COMING SOON
            </div>
            <p className="mt-8 text-center text-sm text-amber-200/60">
              We're putting together something good. Get in touch to be notified.
            </p>
            <a
              href="/contact"
              className="mt-8 inline-block rounded border border-amber-700/60 bg-amber-900/30 px-5 py-2.5 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-800/40"
            >
              Contact us
            </a>
          </div>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-amber-900/60">
        Design 05 — Paper card
      </div>
    </main>
  );
}
