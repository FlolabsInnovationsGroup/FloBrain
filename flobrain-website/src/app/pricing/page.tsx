"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import PlanUpgradePopup from "./components/popup";

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
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  const currentPlan = {
    name: "Developer",
    price: "Free",
    period: "",
  };

  const pricingTiers: PricingTier[] = [
    {
      name: "Developer",
      description: "Perfect for hobbyists and early development",
      price: "Free",
      period: "",
      devices: "3 devices",
      cpuCores: "10K cpu/mins",
      memory: "Workflows",
      storage: "1GB storage",
      buttonText: "Start using",
      buttonVariant: "outline",
      apiCallsLimit: "10,000 API calls/month",
      deviceLimit: "Up to 3 devices",
      memoryStorageLimit: "1GB memory storage",
      features: [
        "Community support",
        "30-day event retention",
        "7-day data retention",
        "Public project templates",
      ],
    },
    {
      name: "Pro",
      badge: "BEST VALUE",
      description: "For startups and small teams building products",
      price: billingCycle === "monthly" ? "$ 49" : "$ 470",
      period: billingCycle === "monthly" ? "/month" : "/year",
      devices: "30 devices",
      cpuCores: "100K cpu/mins",
      memory: "Workflows",
      storage: "10GB storage",
      buttonText: "Start Free Trial",
      buttonVariant: "primary",
      apiCallsLimit: "500,000 API calls/month",
      deviceLimit: "Up to 30 devices",
      memoryStorageLimit: "50GB memory storage",
      features: [
        "Unlimited workflows/automations",
        "Priority email support",
        "Advanced monitoring",
        "30-day data retention",
        "Custom workflow templates",
        "Webhook integrations",
        "Multi-tenant AI routing",
      ],
    },
    {
      name: "Business",
      description: "For growing businesses and production deployments",
      price: billingCycle === "monthly" ? "$ 299" : "$ 2,870",
      period: billingCycle === "monthly" ? "/month" : "/year",
      devices: "100 devices",
      cpuCores: "5M cpu/mins",
      memory: "Workflows",
      storage: "500GB storage",
      buttonText: "Start Free Trial",
      buttonVariant: "outline",
      apiCallsLimit: "5,000,000 API calls/month",
      deviceLimit: "Up to 500 devices",
      memoryStorageLimit: "500GB memory storage",
      features: [
        "Unlimited workflows",
        "Priority support with 4-hour SLA",
        "Full analytics suite",
        "90-day data retention",
        "Team collaboration tools",
        "Custom model fine-tuning",
        "Advanced security controls",
        "SSO & RBAC",
        "API rate limit customization",
        "99.95% uptime SLA",
        "Dedicated account manager",
      ],
    },
    {
      name: "Enterprise",
      description: "For large organizations with custom needs",
      price: "Custom",
      period: "",
      devices: "Unlimited",
      cpuCores: "Unlimited",
      memory: "Custom",
      storage: "Unlimited",
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      apiCallsLimit: "Unlimited API calls",
      deviceLimit: "Unlimited devices",
      memoryStorageLimit: "Custom memory storage",
      features: [
        "Unlimited workflows",
        "Custom model training",
        "24/7 dedicated support",
        "Custom data retention",
        "On-premise deployment option",
        "Custom model fine-tuning",
        "White-label solutions",
        "Advanced compliance",
        "ISOC 2, HIPAA",
        "Custom integrations",
        "Dedicated infrastructure",
        "Volume discounts",
        "Training & onboarding",
      ],
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mb-8">
        {pricingTiers.map((tier, index) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
              tier.badge
                ? "bg-gradient-to-br from-[#2a1a4a] to-[#1a0033] border-[#8b5cf6] shadow-xl shadow-[#8b5cf6]/20"
                : "bg-[#1a1a2e]/80 backdrop-blur-sm border-[#4c1d95]/50"
            }`}
          >
            {/* Badge */}
            {tier.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-4 py-1 rounded-full text-white text-xs font-bold">
                  {tier.badge}
                </div>
              </div>
            )}

            <div className="p-6 flex-grow flex flex-col">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                  index === 0
                    ? "bg-[#3b82f6]/20"
                    : index === 1
                      ? "bg-[#a78bfa]/20"
                      : index === 2
                        ? "bg-[#f97316]/20"
                        : "bg-[#64748b]/20"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg ${
                    index === 0
                      ? "bg-[#3b82f6]"
                      : index === 1
                        ? "bg-[#a78bfa]"
                        : index === 2
                          ? "bg-[#f97316]"
                          : "bg-[#64748b]"
                  }`}
                />
              </div>

              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>

              {/* Description */}
              <p className="text-[#a1a1aa] text-sm mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && (
                    <span className="text-[#a1a1aa] ml-1 text-sm">{tier.period}</span>
                  )}
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                <div className="bg-[#2a1a4a]/50 rounded-lg p-3 border border-[#4c1d95]/30">
                  <div className="text-[#a1a1aa] mb-1">Devices</div>
                  <div className="text-white font-medium">{tier.devices}</div>
                </div>
                <div className="bg-[#2a1a4a]/50 rounded-lg p-3 border border-[#4c1d95]/30">
                  <div className="text-[#a1a1aa] mb-1">CPU/mins</div>
                  <div className="text-white font-medium">{tier.cpuCores}</div>
                </div>
                <div className="bg-[#2a1a4a]/50 rounded-lg p-3 border border-[#4c1d95]/30">
                  <div className="text-[#a1a1aa] mb-1">Memory</div>
                  <div className="text-white font-medium">{tier.memory}</div>
                </div>
                <div className="bg-[#2a1a4a]/50 rounded-lg p-3 border border-[#4c1d95]/30">
                  <div className="text-[#a1a1aa] mb-1">Storage</div>
                  <div className="text-white font-medium">{tier.storage}</div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanClick(tier)}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 mb-6 ${
                  tier.buttonVariant === "primary"
                    ? "bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white hover:shadow-lg hover:shadow-[#8b5cf6]/50"
                    : "bg-transparent border-2 border-[#4c1d95] text-white hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/10"
                }`}
              >
                {tier.buttonText}
                <span className="ml-2">→</span>
              </button>

              {/* Features List */}
              <div className="space-y-3 flex-grow">
                <div className="text-white font-medium text-sm mb-3">{tier.apiCallsLimit}</div>
                <div className="text-white font-medium text-sm mb-3">{tier.deviceLimit}</div>
                <div className="text-white font-medium text-sm mb-4">{tier.memoryStorageLimit}</div>

                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#a1a1aa] text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="text-center mt-8">
        <p className="text-[#a1a1aa] text-sm">
          Need help choosing?{" "}
          <a href="#" className="text-[#8b5cf6] hover:underline font-medium">
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
