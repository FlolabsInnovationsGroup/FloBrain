"use client";

import { useState } from "react";
import PlanUpgradePopup from "./components/popup";
import PricingCard from "./components/PricingCard";
import { PLANS, getPlanPrice, getInheritsLabel } from "./plans";
import type { PricingCardTier } from "./components/PricingCard";
import { MotionProvider, Reveal, Stagger, StaggerItem } from "@/components/motion";
import type { MotionVariantName } from "@/components/motion";

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
<<<<<<< HEAD
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-8 sm:px-6 md:p-12 fb-page">
      {/* Header */}
      <div className="mb-10 max-w-3xl text-center md:mb-12">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
          <span style={{ color: "var(--fb-pricing-title)" }}>Pricing Built for </span>
          <span className="bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#c026d3] bg-clip-text text-transparent dark:from-[#e879f9] dark:via-[#c084fc] dark:to-[#a78bfa]">
            Every Stage of Growth
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg" style={{ color: "var(--fb-pricing-body)" }}>
          From individual user to enterprise teams, FloBrain scales with you. Start free and upgrade
          as you grow.
        </p>
      </div>
=======
    <MotionProvider>
      <main className="flex min-h-screen flex-col items-center justify-start px-4 py-8 sm:px-6 md:p-12">
        <div className="mb-10 max-w-3xl text-center md:mb-12">
          <Reveal variant="slideUp" delay={0}>
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              <span className="text-white">Pricing Built for </span>
              <span className="bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#a78bfa] bg-clip-text text-transparent">
                Every Stage of Growth
              </span>
            </h1>
          </Reveal>
          <Reveal variant="fadeIn" delay={0.1}>
            <p className="mt-4 text-base text-zinc-400 sm:text-lg">
              From individual user to enterprise teams, FloBrain scales with you. Start free and
              upgrade as you grow.
            </p>
          </Reveal>
        </div>
>>>>>>> origin/main

        <Stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mb-8 items-stretch"
          stagger={0.1}
          inView
        >
          {pricingTiers.map((tier, index) => (
            <StaggerItem key={tier.name} variant={pricingCardVariant(index, tier.badge)}>
              <PricingCard
                tier={tier}
                index={index}
                onSelect={() => handlePlanClick(tier)}
              />
            </StaggerItem>
          ))}
        </Stagger>

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
    </MotionProvider>
  );
}

function pricingCardVariant(index: number, badge?: string): MotionVariantName {
  if (badge) return "popUp";
  return index % 2 === 0 ? "slideLeft" : "slideRight";
}
