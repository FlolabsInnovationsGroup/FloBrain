"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motionVariants, VIEWPORT_ONCE, type MotionVariantName } from "./variants";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  inView?: boolean;
};

export function Stagger({
  children,
  className,
  stagger = 0.08,
  inView = true,
}: StaggerProps) {
  return (
    <m.div
      className={cn(className)}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: 0 },
        },
      }}
      initial="hidden"
      animate={inView ? undefined : "visible"}
      whileInView={inView ? "visible" : undefined}
      viewport={inView ? VIEWPORT_ONCE : undefined}
      style={{ backfaceVisibility: "hidden" }}
    >
      {children}
    </m.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  variant?: MotionVariantName;
  className?: string;
};

export function StaggerItem({ children, variant = "slideUp", className }: StaggerItemProps) {
  return (
    <m.div
      className={cn(className)}
      variants={motionVariants[variant]}
      style={{ backfaceVisibility: "hidden" }}
    >
      {children}
    </m.div>
  );
}
