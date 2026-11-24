"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldError } from "./AuthChrome";
import { PASSWORD_RULES, passwordScore, strengthMeta } from "./passwordRules";

export function AuthTextField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  invalid = false,
  error,
  disabled = false,
}: {
  label: string;
  id?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  error?: string | null;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="fb-auth-field">
      <label className="fb-auth-label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className={`fb-auth-input${invalid || error ? " is-invalid" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={Boolean(invalid || error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

export function PasswordField({
  label,
  id,
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  invalid = false,
  error,
  disabled = false,
}: {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  error?: string | null;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const showError = Boolean(invalid || error);

  return (
    <div className="fb-auth-field">
      <label className="fb-auth-label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="fb-auth-control">
        <input
          id={fieldId}
          className={`fb-auth-input has-toggle${showError ? " is-invalid" : ""}`}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={showError}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="fb-auth-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

export function PasswordRules({
  password,
  revealed,
}: {
  password: string;
  revealed: boolean;
}) {
  return (
    <ul className="fb-auth-rules">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        const state = !revealed && !password ? "" : passed ? " is-pass" : " is-fail";
        return (
          <li key={rule.id} className="fb-auth-rule">
            <span className={`fb-auth-rule-icon${state}`} aria-hidden="true">
              {state.includes("pass") ? (
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path
                    d="M5 12.5 10 17.5 19 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : state.includes("fail") ? (
                "!"
              ) : null}
            </span>
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function StrengthMeter({ password }: { password: string }) {
  const meta = strengthMeta(password ? passwordScore(password) : 0);
  return (
    <div className="fb-auth-strength" aria-hidden={meta.tone === "empty"}>
      <div className="fb-auth-strength-bars">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className={index < meta.filled ? `is-${meta.tone}` : ""} />
        ))}
      </div>
      {meta.label ? (
        <span className={`fb-auth-strength-label is-${meta.tone}`}>{meta.label}</span>
      ) : (
        <span className="fb-auth-strength-label" />
      )}
    </div>
  );
}
