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
    <main className="flex min-h-screen flex-col items-center justify-start p-8 md:p-12">
      {/* Header */}
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

      {/* Pricing Cards Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mb-8 items-stretch">
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