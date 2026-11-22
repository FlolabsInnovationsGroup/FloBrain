import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  inView?: boolean;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  variant?: string;
}) {
  return <div className={className}>{children}</div>;
}
