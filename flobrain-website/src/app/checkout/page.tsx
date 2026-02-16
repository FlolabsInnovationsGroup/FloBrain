"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CheckoutPage from "./components/CheckoutPage";
import { getPlanByName } from "../pricing/plans";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planName = searchParams.get("plan") || "Pro";
  const planPrice = searchParams.get("price");
  const planPeriod = searchParams.get("period");

  // Auth check: Redirect to signin if not authenticated
  useEffect(() => {
    // Check if user is authenticated
    // In a real app, check for auth token/session cookie
    // For now, we'll check if user has visited authenticated routes
    const isAuthenticated =
      typeof window !== "undefined" &&
      (sessionStorage.getItem("isAuthenticated") === "true" ||
        localStorage.getItem("isAuthenticated") === "true");

    if (!isAuthenticated) {
      // Redirect to signin with current page as redirect target
      const currentParams = searchParams.toString();
      const redirectUrl = `/signin?redirect=/checkout${currentParams ? "?" + currentParams : ""}`;
      router.push(redirectUrl);
    }
  }, [searchParams, router]);

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
