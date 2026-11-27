"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLogo, AuthShell, AuthSubmit } from "@/components/auth/AuthChrome";
import { AuthTextField, PasswordField, PasswordRules } from "@/components/auth/AuthFields";
import { saveActivationDraft } from "@/components/auth/activationDraft";
import { firstPasswordError, isEmail } from "@/components/auth/passwordRules";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextUsername = username.trim();
    let nextUsernameError: string | null = null;
    let nextConfirmError: string | null = null;

    if (!nextUsername) nextUsernameError = "Email is required.";
    else if (!isEmail(nextUsername)) nextUsernameError = "Enter a valid email address.";

    const ruleError = firstPasswordError(password);
    if (ruleError) nextConfirmError = ruleError;
    else if (password !== confirmPassword) nextConfirmError = "Passwords do not match.";

    setUsernameError(nextUsernameError);
    setConfirmError(nextConfirmError);
    setRevealed(true);
    if (nextUsernameError || nextConfirmError) return;

    setLoading(true);
    saveActivationDraft({ username: nextUsername, password });
    router.push("/register/phone");
  }

  return (
    <AuthShell>
      <AuthLogo />
      <h1 className="fb-auth-title">Activate your account</h1>
      <p className="fb-auth-subtitle">Set and create your own account here</p>
      <form className="fb-auth-form" onSubmit={handleSubmit} noValidate>
        <AuthTextField
          id="username"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="sarah.chen@company.com"
          value={username}
          error={usernameError}
          disabled={loading}
          onChange={(value) => {
            setUsername(value);
            setUsernameError(null);
          }}
        />
        <PasswordField
          id="password"
          label="Create new password"
          autoComplete="new-password"
          value={password}
          disabled={loading}
          onChange={(value) => {
            setPassword(value);
            if (revealed) setConfirmError(firstPasswordError(value));
          }}
        />
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
        <PasswordRules password={password} revealed={revealed} />
        <AuthSubmit loading={loading}>Save and Continue</AuthSubmit>
      </form>
    </AuthShell>
  );
}
