import type { Variants } from "framer-motion";

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const MOTION_TRANSITION = {
  duration: 0.5,
  ease: MOTION_EASE,
} as const;

export type MotionVariantName = "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "popUp";

export const motionVariants: Record<MotionVariantName, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: MOTION_TRANSITION },
  },
  slideUp: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: MOTION_TRANSITION },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0, transition: MOTION_TRANSITION },
  },
  slideRight: {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0, transition: MOTION_TRANSITION },
  },
  popUp: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: MOTION_TRANSITION },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const VIEWPORT_ONCE = {
  once: true,
  amount: 0.15,
  margin: "-80px 0px 0px 0px",
} as const;
