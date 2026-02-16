"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentMethodPage from "./components/PaymentMethodPage";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth check: Redirect to signin if not authenticated
  useEffect(() => {
    const isAuthenticated =
      typeof window !== "undefined" &&
      (sessionStorage.getItem("isAuthenticated") === "true" ||
        localStorage.getItem("isAuthenticated") === "true");

    if (!isAuthenticated) {
      const currentParams = searchParams.toString();
      const redirectUrl = `/signin?redirect=/payment${currentParams ? "?" + currentParams : ""}`;
      router.push(redirectUrl);
    }
  }, [searchParams, router]);

  return <PaymentMethodPage />;
}

export default function PaymentMethod() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
