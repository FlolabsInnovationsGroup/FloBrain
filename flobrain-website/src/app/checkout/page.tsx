"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CheckoutPage from "./components/CheckoutPage";
import { getPlanByName } from "../pricing/plans";
import { useAuth } from "@/contexts/AuthContext";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const planName = searchParams.get("plan") || "Pro";
  const planPrice = searchParams.get("price");
  const planPeriod = searchParams.get("period");

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) return;

    const currentParams = searchParams.toString();
    const redirectPath = `/checkout${currentParams ? `?${currentParams}` : ""}`;
    const redirectUrl = `/signin?redirect=${encodeURIComponent(redirectPath)}`;
    router.replace(redirectUrl);
  }, [isAuthenticated, isLoading, searchParams, router]);

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
