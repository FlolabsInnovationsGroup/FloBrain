export type BillingCycle = "monthly" | "annual";

export interface PlanDefinition {
  id: "personal" | "pro" |"enterprise";
  name: string;
  badge?: string;
  description: string;
  monthlyPrice?: string;
  annualPrice?: string;
  /** Secondary price label (e.g. "/Contact us" for Enterprise) */
  priceSuffix?: string;
  devices: string;
  calls: string;
  memory: string;
  workflows: string;
  buttonText: string;
  /** Base features (Developer). For higher tiers, these are the ADDITIONAL features only. */
  features: string[];
  /** When set, display "All in {parent} plus:" followed by features. */
  inheritsFrom?: "personal" | "pro" ;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "personal",
    name: "Personal",
    description: "Perfect for hobbyists and experimentation",
    monthlyPrice: "Free",
    devices: "1",
    calls: "100/mo",
    memory: "100 MB storage",
    workflows: "10/day",
    buttonText: "Start using",
    features: [
      "Access to GPT model",
      "Image understanding",
      "Voice-to-voice conversation",
      "System monitoring",
      "Short memory persistence",
      "User support",
      "Data privacy",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    description: "For advanced personal use or startups and small teams",
    monthlyPrice: "$20",
    annualPrice: "$240",
    devices: "5",
    calls: "500K/mo",
    memory: "5 GB storage",
    workflows: "100/day",
    buttonText: "Start Free Trial",
    inheritsFrom: "personal",
    features: [
     "Access to Claude model",
     "Access to Gemini model",
     "Long memory persistence",
     "Team with up to 5 members",
     "Files integration",
     "Custom preferences"
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    monthlyPrice: "Custom",
    priceSuffix: "/Contact us",
    devices: "Unlimited",
    calls: "Unlimited",
    memory: "Custom",
    workflows: "Unlimited",
    buttonText: "Contact Sales",
    inheritsFrom: "pro",
    features: [
    "Team with unlimited members",
    "Enterprise's model integration",
    "Greater file upload limit",
    "Compare responses from multiple models",
    ],
  },
];

const INHERITS_LABELS: Record<NonNullable<PlanDefinition["inheritsFrom"]>, string> = {
  personal: "Personal",
  pro: "Pro",
};

export function getInheritsLabel(inheritsFrom: PlanDefinition["inheritsFrom"]): string | undefined {
  return inheritsFrom ? INHERITS_LABELS[inheritsFrom] : undefined;
}

export function getPlanByName(name: string): PlanDefinition | undefined {
  return PLANS.find((plan) => plan.name.toLowerCase() === name.toLowerCase());
}

export function getPlanPrice(
  plan: PlanDefinition,
  cycle: BillingCycle
): { price: string; period: string; priceSuffix?: string } {
  if (cycle === "annual" && plan.annualPrice) {
    return {
      price: plan.annualPrice,
      period: "/year",
      priceSuffix: plan.priceSuffix,
    };
  }
  return {
    price: plan.monthlyPrice ?? "Custom",
    period: plan.monthlyPrice === "Free" || plan.monthlyPrice === "Custom" ? "" : "/month",
    priceSuffix: plan.priceSuffix,
  };
}
