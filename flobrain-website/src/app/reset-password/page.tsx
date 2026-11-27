"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLogo, AuthShell, AuthSubmit, SuccessMark } from "@/components/auth/AuthChrome";
import { PasswordField, PasswordRules, StrengthMeter } from "@/components/auth/AuthFields";
import { firstPasswordError } from "@/components/auth/passwordRules";

/**
 * The reset link cannot be verified against a backend yet.
 * This page implements the designed create-password and success states.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const ruleError = firstPasswordError(password);
    if (ruleError) {
      setConfirmError(ruleError);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setConfirmError(null);
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <AuthShell>
        <div className="fb-auth-success is-reset">
          <AuthLogo centered />
          <SuccessMark />
          <h1 className="fb-auth-title is-center">Your password has been reset</h1>
          <p className="fb-auth-subtitle is-center">
            You can now sign in to your account using your new password.
          </p>
          <button type="button" className="fb-auth-submit w-full" onClick={() => router.push("/signin")}>
            Return to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  const mismatch = confirmError === "Passwords do not match.";

  return (
    <AuthShell>
      <AuthLogo />
      <h1 className="fb-auth-title">Create a new password</h1>
      <p className="fb-auth-subtitle">Choose a strong password for your account.</p>
      <form className="fb-auth-form" onSubmit={handleSubmit} noValidate>
        <PasswordField
          id="password"
          label="New password"
          autoComplete="new-password"
          value={password}
          disabled={loading}
          onChange={(value) => {
            setPassword(value);
            if (confirmError && confirmError !== "Passwords do not match.") {
              setConfirmError(firstPasswordError(value));
            }
          }}
        />
        {mismatch ? <StrengthMeter password={password} /> : null}
        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          disabled={loading}
          invalid={Boolean(confirmError)}
          error={confirmError}
          onChange={(value) => {
            setConfirmPassword(value);
            setConfirmError(null);
          }}
        />
        {mismatch ? null : <StrengthMeter password={password} />}
        <PasswordRules password={password} revealed={Boolean(confirmError) || password.length > 0} />
        <AuthSubmit loading={loading}>Reset password</AuthSubmit>
      </form>
    </AuthShell>
  );
}
