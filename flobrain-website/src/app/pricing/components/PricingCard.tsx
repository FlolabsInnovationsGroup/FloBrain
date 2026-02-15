"use client";

import { Check } from "lucide-react";

export interface PricingCardProps {
  tier: {
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
  };
  index: number;
  onSelect: () => void;
}

const ICON_STYLES = [
  { bg: "bg-[#3b82f6]/20", inner: "bg-[#3b82f6]" },
  { bg: "bg-[#a78bfa]/20", inner: "bg-[#a78bfa]" },
  { bg: "bg-[#f97316]/20", inner: "bg-[#f97316]" },
  { bg: "bg-[#64748b]/20", inner: "bg-[#64748b]" },
] as const;

export default function PricingCard({ tier, index, onSelect }: PricingCardProps) {
  const iconStyle = ICON_STYLES[index % ICON_STYLES.length];

  return (
    <div
      className={`relative flex flex-col h-full rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        tier.badge
          ? "bg-gradient-to-br from-[#2a1a4a] to-[#1a0033] border-[#8b5cf6] shadow-xl shadow-[#8b5cf6]/20"
          : "bg-[#1a1a2e]/80 backdrop-blur-sm border-[#4c1d95]/50"
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-4 py-1 rounded-full text-white text-xs font-bold">
            {tier.badge}
          </div>
        </div>
      )}

      <div className="p-6 flex flex-col h-full">
        <div
          className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center flex-shrink-0 ${iconStyle.bg}`}
        >
          <div className={`w-6 h-6 rounded-lg ${iconStyle.inner}`} />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 min-h-[2rem] flex items-center">
          {tier.name}
        </h3>

        <p className="text-[#a1a1aa] text-sm mb-6 min-h-[2.5rem]">
          {tier.description}
        </p>

        <div className="mb-6 min-h-[3rem] flex items-end">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-white">{tier.price}</span>
            {tier.period && (
              <span className="text-[#a1a1aa] ml-1 text-sm">{tier.period}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 text-xs flex-shrink-0">
          <div className="bg-[#2a1a4a]/50 rounded-lg p-3 border border-[#4c1d95]/30 flex flex-col items-center justify-center text-center min-h-[80px]">
            <div className="text-[#a1a1aa] mb-1">Devices</div>
            <div className="text-white font-medium">{tier.devices}</div>
          </div>
          <div className="bg-[#2a1a4a]/50 rounded-lg p-3 border border-[#4c1d95]/30 flex flex-col items-center justify-center text-center min-h-[80px]">
            <div className="text-[#a1a1aa] mb-1">CPU/mins</div>
            <div className="text-white font-medium">{tier.cpuCores}</div>
          </div>
          <div className="bg-[#2a1a4a]/50 rounded-lg p-3 border border-[#4c1d95]/30 flex flex-col items-center justify-center text-center min-h-[80px]">
            <div className="text-[#a1a1aa] mb-1">Memory</div>
            <div className="text-white font-medium">{tier.memory}</div>
          </div>
          <div className="bg-[#2a1a4a]/50 rounded-lg p-3 border border-[#4c1d95]/30 flex flex-col items-center justify-center text-center min-h-[80px]">
            <div className="text-[#a1a1aa] mb-1">Storage</div>
            <div className="text-white font-medium">{tier.storage}</div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mb-6">
          <div className="text-white font-medium text-sm mb-3">
            {tier.apiCallsLimit}
          </div>
          <div className="text-white font-medium text-sm mb-3">
            {tier.deviceLimit}
          </div>
          <div className="text-white font-medium text-sm mb-4">
            {tier.memoryStorageLimit}
          </div>

          {tier.inheritsFromPlan && (
            <p className="text-white/80 text-sm font-medium mb-2">
              All in {tier.inheritsFromPlan} plus:
            </p>
          )}

          {tier.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
              <span className="text-[#a1a1aa] text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onSelect}
          className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${
            tier.buttonVariant === "primary"
              ? "bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white hover:shadow-lg hover:shadow-[#8b5cf6]/50"
              : "bg-transparent border-2 border-[#4c1d95] text-white hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/10"
          }`}
        >
          {tier.buttonText}
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}
