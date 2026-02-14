export type BillingCycle = "monthly" | "annual";

export interface PlanDefinition {
  id: "developer" | "pro" | "business" | "enterprise";
  name: string;
  badge?: string;
  description: string;
  monthlyPrice?: string;
  annualPrice?: string;
  devices: string;
  cpuCores: string;
  memory: string;
  storage: string;
  apiCallsLimit: string;
  deviceLimit: string;
  memoryStorageLimit: string;
  /** Base features (Developer). For higher tiers, these are the ADDITIONAL features only. */
  features: string[];
  /** When set, display "All in {parent} plus:" followed by features. */
  inheritsFrom?: "developer" | "pro" | "business";
}

export const PLANS: PlanDefinition[] = [
  {
    id: "developer",
    name: "Developer",
    description: "Perfect for hobbyists and early development",
    monthlyPrice: "Free",
    devices: "3 devices",
    cpuCores: "10K cpu/mins",
    memory: "Workflows",
    storage: "1GB storage",
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
    id: "pro",
    name: "Pro",
    badge: "BEST VALUE",
    description: "For startups and small teams building products",
    monthlyPrice: "$ 49",
    annualPrice: "$ 470",
    devices: "30 devices",
    cpuCores: "100K cpu/mins",
    memory: "Workflows",
    storage: "10GB storage",
    apiCallsLimit: "500,000 API calls/month",
    deviceLimit: "Up to 30 devices",
    memoryStorageLimit: "50GB memory storage",
    inheritsFrom: "developer",
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
    id: "business",
    name: "Business",
    description: "For growing businesses and production deployments",
    monthlyPrice: "$ 299",
    annualPrice: "$ 2,870",
    devices: "100 devices",
    cpuCores: "5M cpu/mins",
    memory: "Workflows",
    storage: "500GB storage",
    apiCallsLimit: "5,000,000 API calls/month",
    deviceLimit: "Up to 500 devices",
    memoryStorageLimit: "500GB memory storage",
    inheritsFrom: "pro",
    features: [
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
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    monthlyPrice: "Custom",
    devices: "Unlimited",
    cpuCores: "Unlimited",
    memory: "Custom",
    storage: "Unlimited",
    apiCallsLimit: "Unlimited API calls",
    deviceLimit: "Unlimited devices",
    memoryStorageLimit: "Custom memory storage",
    inheritsFrom: "business",
    features: [
      "Custom model training",
      "24/7 dedicated support",
      "Custom data retention",
      "On-premise deployment option",
      "White-label solutions",
      "Advanced compliance (SOC 2, HIPAA)",
      "Custom integrations",
      "Dedicated infrastructure",
      "Volume discounts",
      "Training & onboarding",
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
): { price: string; period: string } {
  if (cycle === "annual" && plan.annualPrice) {
    return { price: plan.annualPrice, period: "/year" };
  }

  return {
    price: plan.monthlyPrice ?? "Custom",
    period: plan.monthlyPrice === "Free" || plan.monthlyPrice === "Custom" ? "" : "/month",
  };
}

