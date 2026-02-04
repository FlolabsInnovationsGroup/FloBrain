"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CheckoutPage from "./components/CheckoutPage";


function CheckoutContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get("plan") || "Pro";
  const planPrice = searchParams.get("price") || "$ 49";
  const planPeriod = searchParams.get("period") || "/month"; 
  
  const selectedPlan = {
    name: planName,
    price: planPrice,
    period: planPeriod, 
    features: [
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
