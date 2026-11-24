"use client";

import { useRouter } from "next/navigation";
import { AuthLogo, AuthShell, SuccessMark } from "@/components/auth/AuthChrome";

export default function AccountReadyPage() {
  const router = useRouter();

  return (
    <AuthShell>
      <div className="fb-auth-success">
        <AuthLogo centered />
        <SuccessMark orbit />
        <h1 className="fb-auth-title is-center">You&apos;re all set!</h1>
        <p className="fb-auth-subtitle is-center">Your Flolabs account is ready to use.</p>
        <button type="button" className="fb-auth-submit w-full" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </button>
      </div>
    </AuthShell>
  );
}
