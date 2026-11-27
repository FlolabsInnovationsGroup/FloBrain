"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLogo, AuthShell, AuthSubmit, FieldError } from "@/components/auth/AuthChrome";
import { CountrySelect } from "@/components/auth/CountrySelect";
import { findCountry } from "@/components/auth/countries";
import {
  clearActivationDraft,
  nameFromEmail,
  readActivationDraft,
} from "@/components/auth/activationDraft";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatNational(dial: string, digits: string): string {
  if (dial !== "+1") return digits;
  const clipped = digits.slice(0, 10);
  if (clipped.length < 4) return clipped;
  if (clipped.length < 7) return `(${clipped.slice(0, 3)}) ${clipped.slice(3)}`;
  return `(${clipped.slice(0, 3)}) ${clipped.slice(3, 6)}-${clipped.slice(6)}`;
}

function isValidPhone(dial: string, digits: string): boolean {
  if (dial === "+1") return digits.length === 10;
  return digits.length >= 7 && digits.length <= 15;
}

export default function ActivatePhonePage() {
  const router = useRouter();
  const { register } = useAuth();
  const [ready, setReady] = useState(false);
  const [countryCode, setCountryCode] = useState<string>("US");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const country = useMemo(() => findCountry(countryCode), [countryCode]);

  useEffect(() => {
    if (!readActivationDraft()) {
      router.replace("/register");
      return;
    }
    setReady(true);
  }, [router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const draft = readActivationDraft();
    if (!draft) {
      router.replace("/register");
      return;
    }
    const digits = digitsOnly(phone);
    if (!isValidPhone(country.dial, digits)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await register({
        name: nameFromEmail(draft.username),
        email: draft.username,
        password: draft.password,
        phone: `${country.dial}${digits}`,
      });
      if (!result.ok) {
        setError(result.error ?? "We couldn't activate this account. Try again.");
        return;
      }
      clearActivationDraft();
      router.push("/register/ready");
    } catch {
      setError("We couldn't activate this account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <AuthShell><p className="fb-auth-subtitle">Loading account setup…</p></AuthShell>;
  }

  return (
    <AuthShell>
      <AuthLogo />
      <h1 className="fb-auth-title">Set up your phone number</h1>
      <p className="fb-auth-subtitle">
        We use your phone number to keep your account secure and help you access support when needed.
      </p>
      <form className="fb-auth-form" onSubmit={handleSubmit} noValidate>
        <div className="fb-auth-field">
          <label className="fb-auth-label" htmlFor="country-code">
            Country code
          </label>
          <CountrySelect
            id="country-code"
            value={country.code}
            disabled={loading}
            onChange={(code) => {
              setCountryCode(code);
              setPhone("");
              setError(null);
            }}
          />
        </div>

        <div className="fb-auth-field">
          <label className="fb-auth-label" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            className={`fb-auth-input${error ? " is-invalid" : ""}`}
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={country.dial === "+1" ? "(415) 555-0123" : "5551234567"}
            value={phone}
            disabled={loading}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setPhone(formatNational(country.dial, digitsOnly(event.target.value)));
              setError(null);
            }}
          />
          {error ? <FieldError>{error}</FieldError> : null}
          <p className="fb-auth-helper">
            <Info size={14} aria-hidden="true" />
            This number will only be used for account security and support purposes.
          </p>
        </div>

        <AuthSubmit loading={loading}>Save and continue</AuthSubmit>
      </form>
    </AuthShell>
  );
}
