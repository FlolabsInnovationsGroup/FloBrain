"use client";

import { useState } from "react";
import PlanUpgradePopup from "./components/popup";
import PricingCard from "./components/PricingCard";
import { PLANS, getPlanPrice, getInheritsLabel } from "./plans";
import type { PricingCardTier } from "./components/PricingCard";

export default function Pricing() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingCardTier | null>(null);

  const currentPlan = {
    name: "Developer",
    price: "Free",
    period: "",
  };

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

  const handlePlanClick = (tier: PricingCardTier) => {
    setSelectedTier(tier);
    setIsPopupOpen(true);
  };

  const handleConfirm = () => {
    if (selectedTier?.price === "Free") {
      setIsPopupOpen(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-8 sm:px-6 md:p-12">
      {/* Header */}
      <div className="mb-10 max-w-3xl text-center md:mb-12">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
          <span className="text-white">Pricing Built for </span>
          <span className="bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#a78bfa] bg-clip-text text-transparent">
            Every Stage of Growth
          </span>
        </h1>
        <p className="mt-4 text-base text-zinc-400 sm:text-lg">
          From individual user to enterprise teams, FloBrain scales with you. Start free and upgrade
          as you grow.
        </p>
      </div>

      {/* Pricing Cards Grid - 4 columns */}
      <div className="mb-8 grid w-full max-w-7xl grid-cols-1 items-stretch gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier, index) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            index={index}
            onSelect={() => handlePlanClick(tier)}
          />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="text-center mt-8">
        <p className="text-zinc-400 text-sm">
          Need help choosing?{" "}
          <a href="/contact" className="text-[#a78bfa] hover:underline font-medium">
            Contact our sales team
          </a>
        </p>
      </div>

      {selectedTier && (
        <PlanUpgradePopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          currentPlan={currentPlan}
          selectedPlan={{
            name: selectedTier.name,
            price: selectedTier.price,
            period: selectedTier.period,
          }}
          onConfirm={handleConfirm}
        />
      )}
    </main>
  );
}