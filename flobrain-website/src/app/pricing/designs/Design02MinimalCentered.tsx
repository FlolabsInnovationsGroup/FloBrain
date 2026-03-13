"use client";

import { Syne } from "next/font/google";
import { motion } from "framer-motion";

const syne = Syne({ subsets: ["latin"], variable: "--font-display" });

export default function Design02MinimalCentered() {
  return (
    <main
      className={`${syne.variable} relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden px-6 py-16 md:px-12`}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a0612_0%,#0d0a14_50%,#070410_100%)]" />
        <div
          className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-30"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.6) 50%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/30 px-4 py-2 text-sm font-medium text-violet-300"
        >
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
          </span>
          In the works
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl"
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
        >
          Pricing
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-4 text-3xl font-light tracking-wide text-zinc-400 sm:text-4xl md:text-5xl"
        >
          Coming soon
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 max-w-md text-base text-zinc-500"
        >
          We're putting together plans that scale with every stage of growth. Stay tuned.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }} className="mt-12">
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-6 py-3 text-sm font-medium text-violet-300 transition-colors hover:border-violet-400/50 hover:bg-violet-500/20 hover:text-violet-200"
          >
            Get notified
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </main>
  );
}
