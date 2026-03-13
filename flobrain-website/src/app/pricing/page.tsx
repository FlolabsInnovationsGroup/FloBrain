"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PRICING_DESIGNS } from "./designs";

function PricingContent() {
  const searchParams = useSearchParams();
  const designParam = searchParams.get("design");
  const designNum = Math.min(20, Math.max(1, parseInt(designParam || "1", 10) || 1));
  const design = PRICING_DESIGNS[designNum - 1];
  const DesignComponent = design.component;

  return (
    <>
      <DesignComponent />
      <nav
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 max-w-[calc(100vw-2rem)] rounded-full border border-zinc-700/50 bg-zinc-900/90 px-3 py-2 shadow-lg backdrop-blur-sm"
        aria-label="Switch pricing design"
      >
        <div className="flex flex-wrap items-center justify-center gap-1">
          <span className="mr-1 text-xs text-zinc-500">Design:</span>
          {PRICING_DESIGNS.map(({ id, name }) => (
            <a
              key={id}
              href={`/pricing?design=${id}`}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors min-w-[1.5rem] text-center ${
                designNum === id
                  ? "bg-violet-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {id}
            </a>
          ))}
        </div>
        <p className="mt-1 text-center text-[10px] text-zinc-500">{design.name}</p>
      </nav>
    </>
  );
}

function PricingFallback() {
  const DesignComponent = PRICING_DESIGNS[0].component;
  return <DesignComponent />;
}

export default function Pricing() {
  return (
    <Suspense fallback={<PricingFallback />}>
      <PricingContent />
    </Suspense>
  );
}
