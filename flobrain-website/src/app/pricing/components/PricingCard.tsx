"use client";

import { Check } from "lucide-react";
import { Brain, Zap, Building2, Crown } from "lucide-react";

export interface PricingCardTier {
  name: string;
  badge?: string;
  description: string;
  price: string;
  period: string;
  priceSuffix?: string;
  devices: string;
  calls: string;
  memory: string;
  workflows: string;
  buttonText: string;
  isPrimary?: boolean;
  features: string[];
  inheritsFromPlan?: string;
}

export interface PricingCardProps {
  tier: PricingCardTier;
  index: number;
  onSelect: () => void;
}

const PLAN_ICONS = [
  { Icon: Brain, label: "Developer" },
  { Icon: Zap, label: "Pro" },
  { Icon: Building2, label: "Business" },
  { Icon: Crown, label: "Enterprise" },
] as const;

const PLAN_ICON_BG = [
  "bg-emerald-500/80",   // Developer - green
  "bg-[#7c3aed]/80",     // Pro - purple
  "bg-orange-500/80",    // Business - orange
  "bg-blue-500/80",      // Enterprise - blue
] as const;

export default function PricingCard({ tier, index }: PricingCardProps) {
  const { Icon } = PLAN_ICONS[index % PLAN_ICONS.length];
  const iconBg = PLAN_ICON_BG[index % PLAN_ICON_BG.length];

  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl border transition-all duration-300 ${
        tier.badge
          ? "bg-[#1e1b2e]/95 border-[#e879f9]/50 shadow-[0_0_30px_rgba(232,121,249,0.25)]"
          : "bg-[#1a1525]/90 border-white/10"
      }`}
    >
      {/* Most Popular - pill above card, overlapping top edge */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-block rounded-full bg-gradient-to-b from-[#7c3aed] to-[#e879f9] px-4 py-1.5 text-white text-sm font-semibold shadow-lg">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col h-full">
        {/* Icon - per-plan color */}
        <div className={`w-11 h-11 rounded-xl mb-4 flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
        <p className="text-zinc-400 text-sm mb-4 min-h-[2.5rem]">{tier.description}</p>

        {/* Price */}
        <div className="mb-4 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{tier.price}</span>
          {tier.period && (
            <span className="text-zinc-400 text-sm">{tier.period}</span>
          )}
          {tier.priceSuffix && (
            <span className="text-zinc-400 text-sm">{tier.priceSuffix}</span>
          )}
        </div>

        {/* 2x2 Key features grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-zinc-500 text-xs mb-0.5">Devices</div>
            <div className="text-white font-medium text-sm whitespace-nowrap">{tier.devices}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-zinc-500 text-xs mb-0.5">Calls</div>
            <div className="text-white font-medium text-sm whitespace-nowrap">{tier.calls}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-zinc-500 text-xs mb-0.5">Memory</div>
            <div className="text-white font-medium text-sm whitespace-nowrap">{tier.memory}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-zinc-500 text-xs mb-0.5">Workflows</div>
            <div className="text-white font-medium text-sm whitespace-nowrap">{tier.workflows}</div>
          </div>
        </div>

        {/* CTA Button */}
        {/* <button
          onClick={onSelect}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0 ${
            tier.isPrimary
              ? "bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] text-white shadow-lg shadow-[#7c3aed]/40 hover:opacity-95"
              : "bg-[#2a2139] border border-white/20 text-white hover:bg-[#352a45]"
          }`}
        >
          {tier.buttonText}
          <span>→</span>
        </button> */}

        {/* Feature list with checkmarks */}
        <div className="mt-5 space-y-2 flex-1 min-h-0">
          {tier.inheritsFromPlan && (
            <p className="text-white/80 text-sm font-medium mb-2">
              All in {tier.inheritsFromPlan} plus:
            </p>
          )}
          {tier.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-zinc-400 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
