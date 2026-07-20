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
  "bg-emerald-500/80",
  "bg-[#7c3aed]/80",
  "bg-orange-500/80",
  "bg-blue-500/80",
] as const;

export default function PricingCard({ tier, index }: PricingCardProps) {
  const { Icon } = PLAN_ICONS[index % PLAN_ICONS.length];
  const iconBg = PLAN_ICON_BG[index % PLAN_ICON_BG.length];

  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border transition-all duration-300 fb-pricing-card ${
        tier.badge
          ? "dark:bg-[#1e1b2e]/95 dark:border-[#e879f9]/50 dark:shadow-[0_0_30px_rgba(232,121,249,0.25)] light:border-[#c4b5fd]/80 light:shadow-[0_4px_24px_rgba(167,139,250,0.2)]"
          : "dark:bg-[#1a1525]/90 dark:border-white/10"
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <span className="inline-block rounded-full bg-gradient-to-b from-[#7c3aed] to-[#a855f7] px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="flex h-full flex-col p-5 sm:p-6">
        <div className={`mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>

        <h3
          className="mb-1 text-xl font-bold"
          style={{ color: "var(--fb-pricing-title)" }}
        >
          {tier.name}
        </h3>
        <p
          className="mb-4 min-h-[2.5rem] text-sm leading-snug"
          style={{ color: "var(--fb-pricing-body)" }}
        >
          {tier.description}
        </p>

        <div className="mb-4 flex flex-wrap items-baseline gap-1">
          <span
            className="text-3xl font-bold"
            style={{ color: "var(--fb-pricing-title)" }}
          >
            {tier.price}
          </span>
          {tier.period && (
            <span className="text-sm" style={{ color: "var(--fb-pricing-muted)" }}>
              {tier.period}
            </span>
          )}
          {tier.priceSuffix && (
            <span className="text-sm" style={{ color: "var(--fb-pricing-muted)" }}>
              {tier.priceSuffix}
            </span>
          )}
        </div>

        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              ["Devices", tier.devices],
              ["Calls", tier.calls],
              ["Memory", tier.memory],
              ["Workflows", tier.workflows],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border p-3 text-center"
              style={{
                background: "var(--fb-pricing-grid-bg)",
                borderColor: "var(--fb-pricing-grid-border)",
              }}
            >
              <div
                className="mb-0.5 text-xs"
                style={{ color: "var(--fb-pricing-grid-label)" }}
              >
                {label}
              </div>
              <div
                className="break-words text-sm font-medium"
                style={{ color: "var(--fb-pricing-grid-value)" }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 min-h-0 flex-1 space-y-2">
          {tier.inheritsFromPlan && (
            <p
              className="mb-2 text-sm font-medium"
              style={{ color: "var(--fb-pricing-body)" }}
            >
              All in {tier.inheritsFromPlan} plus:
            </p>
          )}
          {tier.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-start gap-2">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--fb-pricing-check)" }}
              />
              <span className="text-sm" style={{ color: "var(--fb-pricing-body)" }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
