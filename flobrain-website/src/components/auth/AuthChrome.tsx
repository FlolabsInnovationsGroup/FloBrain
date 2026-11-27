"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import FloBrainMark from "@/assets/images/flolabs-logo.svg";
import SuccessOuterRing from "@/assets/images/auth-success/outer-ring.png";
import SuccessCircle from "@/assets/images/auth-success/success-circle.svg";
import SuccessCheck from "@/assets/images/auth-success/confirmation-check.svg";
import SuccessDot from "@/assets/images/auth-success/celebration-dot.svg";
import "./auth-screens.css";

export function AuthShell({
  children,
  align = "start",
}: {
  children: ReactNode;
  align?: "start" | "center";
}) {
  return (
    <main className={`fb-auth-screen${align === "center" ? " is-centered" : ""}`}>
      <div className="fb-auth-panel">{children}</div>
    </main>
  );
}

export function AuthLogo({ centered = false }: { centered?: boolean }) {
  return (
    <div className={`fb-auth-logo${centered ? " is-center" : ""}`}>
      <Image src={FloBrainMark} alt="" aria-hidden className="fb-auth-logo-mark" priority />
      <span className="fb-auth-logo-word">FloBrain</span>
    </div>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="fb-auth-field-error" role="alert">
      <span className="fb-auth-bang" aria-hidden="true">
        !
      </span>
      <span>{children}</span>
    </p>
  );
}

export function BackToSignIn({ href = "/signin" }: { href?: string }) {
  return (
    <Link href={href} className="fb-auth-back">
      <ArrowLeft size={16} aria-hidden="true" />
      Back to sign in
    </Link>
  );
}

export function AuthSubmit({
  children,
  loading = false,
  login = false,
}: {
  children: ReactNode;
  loading?: boolean;
  login?: boolean;
}) {
  return (
    <button
      type="submit"
      className={`fb-auth-submit w-full${login ? " is-login" : ""}`}
      disabled={loading}
      aria-busy={loading}
    >
      {children}
    </button>
  );
}

export function SuccessMark({ orbit = false }: { orbit?: boolean }) {
  if (!orbit) {
    return (
      <div className="fb-auth-reset-mark" aria-hidden="true">
        <span className="fb-auth-reset-core">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 12.5 10 17.5 19 7.5"
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    );
  }

  return (
    <div className="fb-auth-success-mark" aria-hidden="true">
      <Image src={SuccessDot} alt="" width={6} height={6} className="fb-auth-success-dot d1" />
      <Image src={SuccessDot} alt="" width={6} height={6} className="fb-auth-success-dot d2" />
      <Image src={SuccessDot} alt="" width={6} height={6} className="fb-auth-success-dot d3" />
      <Image src={SuccessDot} alt="" width={6} height={6} className="fb-auth-success-dot d4" />
      <Image src={SuccessOuterRing} alt="" width={176} height={176} className="fb-auth-success-ring" />
      <Image src={SuccessCircle} alt="" width={120} height={120} className="fb-auth-success-circle" />
      <Image
        src={SuccessCheck}
        alt=""
        width={57}
        height={40}
        className="fb-auth-success-check"
      />
    </div>
  );
}

export function MailSentMark() {
  return (
    <div className="fb-auth-mail" aria-hidden="true">
      <svg width="62" height="54" viewBox="0 0 64 56" fill="none">
        <rect x="20" y="1" width="24" height="18" rx="2" fill="#d9d9d9" />
        <path d="M6 16h52v30a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V16z" fill="#2962ff" />
        <path d="M14 16h36L32 36z" fill="#e4e4e4" />
        <path d="M14 16 32 36" stroke="#9db6ff" strokeWidth="2" />
        <path d="M50 16 32 36" stroke="#9db6ff" strokeWidth="2" />
      </svg>
      <span className="fb-auth-mail-badge">
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path
            d="M6 12.5 10 16.5 18 8"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
