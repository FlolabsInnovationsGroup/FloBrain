"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentMethodPage from "./components/PaymentMethodPage";
import { useAuth } from "@/contexts/AuthContext";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) return;

    const currentParams = searchParams.toString();
    const redirectPath = `/payment${currentParams ? `?${currentParams}` : ""}`;
    const redirectUrl = `/signin?redirect=${encodeURIComponent(redirectPath)}`;
    router.replace(redirectUrl);
  }, [isAuthenticated, isLoading, searchParams, router]);

  return <PaymentMethodPage />;
}

export default function PaymentMethod() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
