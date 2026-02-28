"use client";

import { useState } from "react";
import PlanUpgradePopup from "./components/popup";
import PricingCard from "./components/PricingCard";
import { PLANS, type BillingCycle, getPlanPrice, getInheritsLabel } from "./plans";

interface PricingTier {
  name: string;
  badge?: string;
  description: string;
  price: string;
  period: string;
  devices: string;
  cpuCores: string;
  memory: string;
  storage: string;
  buttonText: string;
  buttonVariant: "outline" | "primary";
  apiCallsLimit: string;
  deviceLimit: string;
  memoryStorageLimit: string;
  features: string[];
  inheritsFromPlan?: string;
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  const currentPlan = {
    name: "Developer",
    price: "Free",
    period: "",
  };

  const pricingTiers: PricingTier[] = PLANS.map((plan) => {
    const { price, period } = getPlanPrice(plan, billingCycle);

    // Button styles/text are view-specific
    let buttonText = "Start Free Trial";
    let buttonVariant: "outline" | "primary" = "outline";

    if (plan.id === "developer") {
      buttonText = "Start using";
      buttonVariant = "outline";
    } else if (plan.id === "pro") {
      buttonText = "Start Free Trial";
      buttonVariant = "primary";
    } else if (plan.id === "enterprise") {
      buttonText = "Contact Sales";
      buttonVariant = "outline";
    }

    return {
      name: plan.name,
      badge: plan.badge,
      description: plan.description,
      price,
      period,
      devices: plan.devices,
      cpuCores: plan.cpuCores,
      memory: plan.memory,
      storage: plan.storage,
      buttonText,
      buttonVariant,
      apiCallsLimit: plan.apiCallsLimit,
      deviceLimit: plan.deviceLimit,
      memoryStorageLimit: plan.memoryStorageLimit,
      features: plan.features,
      inheritsFromPlan: getInheritsLabel(plan.inheritsFrom),
    };
  });

  const handlePlanClick = (tier: PricingTier) => {
    setSelectedTier(tier);
    setIsPopupOpen(true);
  };

  const handleConfirm = () => {
    // This will be called from the popup for free/custom plans
    if (selectedTier?.price === "Free") {
      // Activate free plan
      console.warn("Activating free plan:", selectedTier?.name);
      // Call your API to activate the plan
      setIsPopupOpen(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 md:p-12 bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23]">
      {/* Header */}
      <div className="text-center mb-12 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="text-white">Pricing Built for</span>
          <br />
          <span className="bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#e879f9] bg-clip-text text-transparent">
            Every Stage of Growth
          </span>
        </h1>
        <p className="text-[#a1a1aa] text-lg mt-6">
          From individual user to enterprise teams, FloBrain scales with you.
          <br />
          Start free and upgrade as you grow.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="mb-12 flex items-center gap-4 bg-[#1a1a2e]/50 backdrop-blur-sm rounded-full p-2 border border-[#4c1d95]/50">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            billingCycle === "monthly"
              ? "bg-[#8b5cf6] text-white shadow-lg"
              : "text-[#a1a1aa] hover:text-white"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("annual")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            billingCycle === "annual"
              ? "bg-[#8b5cf6] text-white shadow-lg"
              : "text-[#a1a1aa] hover:text-white"
          }`}
        >
          Annual
          <span className="ml-2 text-xs bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full">
            Save 20%
          </span>
        </button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mb-8 items-stretch">
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
        <p className="text-[#a1a1aa] text-sm">
          Need help choosing?{" "}
          <a href="/contact" className="text-[#8b5cf6] hover:underline font-medium">
            Contact our sales team
          </a>
        </p>
      </div>

      {/* Plan Upgrade Popup */}
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