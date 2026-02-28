export type BillingCycle = "monthly" | "annual";

export interface PlanDefinition {
  id: "developer" | "pro" | "business" | "enterprise";
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
  inheritsFrom?: "developer" | "pro" | "business";
}

export const PLANS: PlanDefinition[] = [
  {
    id: "developer",
    name: "Developer",
    description: "Perfect for hobbyists and experimentation",
    monthlyPrice: "Free",
    devices: "3",
    calls: "10K calls/mo",
    memory: "1GB storage",
    workflows: "100/day",
    buttonText: "Start using",
    features: [
      "Community support",
      "Basic documentation",
      "Public Discord channel",
      "API rate limiting",
      "Standard uptime SLA",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    description: "For startups and small teams building products",
    monthlyPrice: "$49",
    annualPrice: "$470",
    devices: "50",
    calls: "500K calls/mo",
    memory: "50GB storage",
    workflows: "Unlimited",
    buttonText: "Start Free Trial",
    inheritsFrom: "developer",
    features: [
      "Priority email support",
      "Advanced analytics dashboard",
      "Custom model routing",
      "Workflow templates library",
      "Team collaboration (5 seats)",
      "Higher rate limits",
      "99.9% uptime SLA",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "For growing businesses and production deployments",
    monthlyPrice: "$299",
    annualPrice: "$2,870",
    devices: "500",
    calls: "5M calls/mo",
    memory: "50GB storage",
    workflows: "Unlimited",
    buttonText: "Start Free Trial",
    inheritsFrom: "pro",
    features: [
      "Priority support (24/5)",
      "SSO & RBAC",
      "Advanced security controls",
      "Custom integrations",
      "Dedicated success manager",
      "Unlimited team seats",
      "White-label options",
      "99.95% uptime SLA",
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
    inheritsFrom: "business",
    features: [
      "Priority support (24/7)",
      "Advanced compliance (SOC 2, HIPAA)",
      "On-premise deployment option",
      "Custom SLAs",
      "Dedicated infrastructure",
      "Custom contract terms",
      "Professional services",
      "Executive business reviews",
    ],
  },
];

const INHERITS_LABELS: Record<NonNullable<PlanDefinition["inheritsFrom"]>, string> = {
  developer: "Developer",
  pro: "Pro",
  business: "Business",
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
