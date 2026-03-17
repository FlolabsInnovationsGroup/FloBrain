"use client";

const PAGE_BG = "bg-[linear-gradient(90deg,#290036_0%,#070014_100%)]";

export function RootBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen flex flex-col ${PAGE_BG}`}>
      {children}
    </div>
  );
}
