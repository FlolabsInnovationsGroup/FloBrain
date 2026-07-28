"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MOTION_TRANSITION, motionVariants, VIEWPORT_ONCE, type MotionVariantName } from "./variants";

type RevealProps = {
  children: ReactNode;
  variant?: MotionVariantName;
  delay?: number;
  inView?: boolean;
  className?: string;
};

export function Reveal({
  children,
  variant = "fadeIn",
  delay = 0,
  inView = false,
  className,
}: RevealProps) {
  const variants = motionVariants[variant];

  return (
    <m.div
      className={cn(className)}
      variants={variants}
      initial="hidden"
      animate={inView ? undefined : "visible"}
      whileInView={inView ? "visible" : undefined}
      viewport={inView ? VIEWPORT_ONCE : undefined}
      transition={delay > 0 ? { ...MOTION_TRANSITION, delay } : undefined}
      style={{ backfaceVisibility: "hidden" }}
    >
      {children}
    </m.div>
  );
}
