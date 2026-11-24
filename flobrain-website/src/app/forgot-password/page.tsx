"use client";

import { useState } from "react";
import { AuthLogo, AuthShell, AuthSubmit, BackToSignIn, MailSentMark } from "@/components/auth/AuthChrome";
import { AuthTextField } from "@/components/auth/AuthFields";
import { saveRecoveryEmail } from "@/components/auth/activationDraft";
import { isEmail } from "@/components/auth/passwordRules";

/**
 * Password recovery email delivery is not backed by an API in this project.
 * The screen still follows the designed states so the flow can be reviewed.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendLink(nextEmail: string) {
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 400));
    saveRecoveryEmail(nextEmail);
    setSentTo(nextEmail);
    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextEmail = email.trim();
    if (!isEmail(nextEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    await sendLink(nextEmail);
  }

  if (sentTo) {
    return (
      <AuthShell>
        <div className="fb-auth-sent">
          <AuthLogo centered />
          <MailSentMark />
          <h1 className="fb-auth-title is-center">We&apos;ve sent you a link</h1>
          <p className="fb-auth-sent-copy">
            Check your email for instructions to reset your password. The link has been sent to{" "}
            <strong>{sentTo}</strong>.
          </p>
          <div className="fb-auth-note">
            <h2>Didn&apos;t receive the email?</h2>
            <p>Check your spam folder or try again.</p>
            <button
              type="button"
              className="fb-auth-outline"
              disabled={loading}
              onClick={() => sendLink(sentTo)}
            >
              Resend email
            </button>
          </div>
          <BackToSignIn />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthLogo />
      <h1 className="fb-auth-title">Forgot your password?</h1>
      <p className="fb-auth-subtitle">
        No worries. Enter your registered email and we&apos;ll send you a link to reset it.
      </p>
      <form className="fb-auth-form" onSubmit={handleSubmit} noValidate>
        <AuthTextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="sarah.chen@company.com"
          value={email}
          error={error}
          disabled={loading}
          onChange={(value) => {
            setEmail(value);
            setError(null);
          }}
        />
        <AuthSubmit loading={loading}>Send recovery link</AuthSubmit>
      </form>
      <BackToSignIn />
    </AuthShell>
  );
}
