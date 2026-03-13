"use client";

import { motion } from "framer-motion";

export default function Design03Editorial() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center overflow-hidden bg-black px-8 py-20 md:px-16">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-12 md:mx-auto md:grid-cols-12 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-5 flex flex-col justify-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400/90">
            FloBrain
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] text-white md:text-5xl lg:text-6xl">
            Pricing.
          </h1>
          <p className="mt-6 text-lg text-zinc-500">
            Plans that scale with every stage of growth. We're putting the finishing touches on something good.
          </p>
          <a
            href="/contact"
            className="mt-10 inline-block border-b-2 border-amber-400/60 pb-1 text-sm font-medium text-amber-400/90 transition-colors hover:border-amber-400"
          >
            Get notified when we launch
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="md:col-span-7 flex items-center justify-center"
        >
          <div className="relative">
            <div className="text-[clamp(4rem,15vw,12rem)] font-black leading-none text-white/5 select-none">
              SOON
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center text-2xl font-medium tracking-[0.4em] text-amber-400/80 md:text-3xl"
              style={{ textShadow: "0 0 40px rgba(251,191,36,0.3)" }}
            >
              COMING SOON
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-8 text-[10px] uppercase tracking-widest text-zinc-600">
        Design 03 — Editorial
      </div>
    </main>
  );
}
