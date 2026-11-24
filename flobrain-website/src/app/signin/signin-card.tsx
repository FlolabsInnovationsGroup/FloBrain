"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  REMEMBERED_USERNAME_KEY,
} from "@/components/auth/activationDraft";
import { AuthLogo, AuthShell, AuthSubmit, FieldError } from "@/components/auth/AuthChrome";
import { PasswordField } from "@/components/auth/AuthFields";
import { isEmail } from "@/components/auth/passwordRules";

const ROLES = [
  { id: "system-owner", label: "System Owner" },
  { id: "admin", label: "Admin" },
  { id: "lead", label: "Lead" },
  { id: "intern", label: "Intern" },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

const CREDENTIAL_ERROR = "The email or password you entered is incorrect. Please try again.";

export function SignInCard() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleId>("lead");
  const [remember, setRemember] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_USERNAME_KEY);
    if (saved) {
      setUsername(saved);
      setRemember(true);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextUsername = username.trim();
    let nextUsernameError: string | null = null;
    let nextPasswordError: string | null = null;

    if (!nextUsername) nextUsernameError = "Email is required.";
    else if (!isEmail(nextUsername)) nextUsernameError = "Enter a valid email address.";
    if (!password) nextPasswordError = "Password is required.";

    setUsernameError(nextUsernameError);
    setPasswordError(nextPasswordError);
    if (nextUsernameError || nextPasswordError) return;

    setLoading(true);
    try {
      const result = await login(nextUsername, password);
      if (remember) localStorage.setItem(REMEMBERED_USERNAME_KEY, nextUsername);
      else localStorage.removeItem(REMEMBERED_USERNAME_KEY);
      if (result.ok) {
        router.push("/dashboard");
        return;
      }
      setPasswordError(CREDENTIAL_ERROR);
    } catch {
      setPasswordError(CREDENTIAL_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthLogo centered />
      <p className="fb-auth-welcome">Welcome to Flobabs Innovations</p>
      <form className="fb-auth-form" onSubmit={handleSubmit} noValidate>
        <div className="fb-auth-field">
          <label className="fb-auth-label" htmlFor="username">
            Email
          </label>
          <input
            id="username"
            className={`fb-auth-input${usernameError ? " is-invalid" : ""}`}
            type="email"
            name="username"
            autoComplete="username"
            placeholder="you@flobrain.com"
            value={username}
            disabled={loading}
            aria-invalid={Boolean(usernameError)}
            onChange={(event) => {
              setUsername(event.target.value);
              setUsernameError(null);
            }}
          />
          {usernameError ? <FieldError>{usernameError}</FieldError> : null}
        </div>

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          disabled={loading}
          error={passwordError}
          onChange={(value) => {
            setPassword(value);
            setPasswordError(null);
          }}
        />

        <fieldset className="fb-auth-field fb-auth-fieldset">
          <legend className="fb-auth-label">Sign In As</legend>
          <div className="fb-auth-roles">
            {ROLES.map((item) => {
              const selected = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`fb-auth-role${selected ? " is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => setRole(item.id)}
                >
                  <span className="fb-auth-role-dot" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <AuthSubmit loading={loading} login>
          LOG IN
        </AuthSubmit>

        <div className="fb-auth-meta-row">
          <label className="fb-auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="fb-auth-text-link">
            Forgot password?
          </Link>
        </div>

        <div className="fb-auth-or">OR</div>
        <p className="fb-auth-invite">
          Have an invite? <Link href="/register">Activate your account</Link>
        </p>
        <p className="fb-auth-legal">© FloBrain. Sign in to your member workspace.</p>
      </form>
    </AuthShell>
  );
}
