"use client";

import { useState } from "react";
import PlanUpgradePopup from "../components/popup";
import PricingCard from "../components/PricingCard";
import { PLANS, getPlanPrice, getInheritsLabel } from "../plans";
import type { PricingCardTier } from "../components/PricingCard";

export default function Design01Ribbon() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingCardTier | null>(null);

  const currentPlan = { name: "Developer", price: "Free", period: "" };

  const pricingTiers: PricingCardTier[] = PLANS.map((plan) => {
    const { price, period, priceSuffix } = getPlanPrice(plan, "monthly");
    return {
      name: plan.name,
      badge: plan.badge,
      description: plan.description,
      price,
      period,
      priceSuffix,
      devices: plan.devices,
      calls: plan.calls,
      memory: plan.memory,
      workflows: plan.workflows,
      buttonText: plan.buttonText,
      isPrimary: plan.id === "pro",
      features: plan.features,
      inheritsFromPlan: getInheritsLabel(plan.inheritsFrom),
    };
  });

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden p-8 md:p-12">
      <div className="text-center mb-12 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-white">Pricing Built for </span>
          <span className="bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#a78bfa] bg-clip-text text-transparent">
            Every Stage of Growth
          </span>
        </h1>
        <p className="text-zinc-400 text-lg mt-4">
          From individual user to enterprise teams, FloBrain scales with you. Start free and upgrade
          as you grow.
        </p>
      </div>

      <div className="w-full max-w-7xl flex flex-col items-center blur-md pointer-events-none select-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8 items-stretch">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={tier.name} tier={tier} index={index} onSelect={() => {}} />
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-zinc-400 text-sm">
            Need help choosing?{" "}
            <a href="/contact" className="text-[#a78bfa] hover:underline font-medium">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute w-[140vw] h-28 -rotate-3 shadow-2xl flex flex-col items-center justify-center gap-1 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #b91c1c 0%, #991b1b 50%, #7f1d1d 100%)",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.4), 0 10px 20px -5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div
            className="absolute inset-0 z-[5] opacity-40 animate-ribbon-shimmer"
            style={{
              background:
                "linear-gradient(105deg, transparent 0%, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
          />
          <div
            className="absolute left-0 top-0 w-12 h-full opacity-90"
            style={{
              background: "linear-gradient(90deg, #7f1d1d 0%, transparent 100%)",
              clipPath: "polygon(0 0, 100% 0, 60% 50%, 100% 100%, 0 100%)",
            }}
          />
          <div
            className="absolute right-0 top-0 w-12 h-full opacity-90"
            style={{
              background: "linear-gradient(270deg, #7f1d1d 0%, transparent 100%)",
              clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%, 40% 50%)",
            }}
          />
          <span
            className="relative z-10 text-white text-2xl md:text-3xl font-bold tracking-[0.35em] uppercase drop-shadow-md whitespace-nowrap animate-pulse-subtle"
            style={{ animationDuration: "2.5s" }}
          >
            Coming Soon
          </span>
          <span className="relative z-10 text-white/90 text-xs md:text-sm font-medium tracking-widest uppercase whitespace-nowrap">
            Something exciting is on the way — stay tuned
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.92; transform: scale(1.02); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 2.5s ease-in-out infinite; }
      `}</style>

      {selectedTier && (
        <PlanUpgradePopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          currentPlan={currentPlan}
          selectedPlan={{ name: selectedTier.name, price: selectedTier.price, period: selectedTier.period }}
          onConfirm={() => selectedTier?.price === "Free" && setIsPopupOpen(false)}
        />
      )}
    </main>
  );
}
