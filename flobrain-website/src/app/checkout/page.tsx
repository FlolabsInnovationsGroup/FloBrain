"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CheckoutPage from "./components/CheckoutPage";
import { getPlanByName } from "../pricing/plans";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get("plan") || "Pro";
  const planPrice = searchParams.get("price");
  const planPeriod = searchParams.get("period");

  const planDefinition = getPlanByName(planName);

  const selectedPlan = {
    name: planDefinition?.name ?? planName,
    price: planPrice || planDefinition?.monthlyPrice || "Custom",
    period:
      planPeriod ??
      (planDefinition?.monthlyPrice &&
      planDefinition.monthlyPrice !== "Free" &&
      planDefinition.monthlyPrice !== "Custom"
        ? "/month"
        : ""),
    features: planDefinition?.features ?? [
      "Unlimited workflows/automations",
      "Priority email support",
      "Advanced monitoring",
      "30-day data retention",
      "Custom workflow templates",
    ],
  };

  return <CheckoutPage selectedPlan={selectedPlan} />;
}

export default function Checkout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
