"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock, EyeOff, Eye, Apple } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.ok) {
        router.push("/dashboard");
        return;
      }
      setError(result.error ?? "Sign in failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fb-auth-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="fb-auth-glow h-[480px] w-[480px] rounded-full opacity-20" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <h1 className="fb-auth-heading text-center text-[28px] font-bold sm:text-[32px]">
          Welcome Back
        </h1>

        <div className="fb-auth-card flex w-full flex-col gap-5 rounded-2xl p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="fb-auth-error rounded-lg border px-3 py-2 text-sm">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="fb-auth-label text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="fb-auth-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="johndoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="fb-auth-input h-12 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="fb-auth-label text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="fb-auth-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="fb-auth-input h-12 w-full rounded-xl border pl-10 pr-12 text-sm outline-none transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  className="fb-auth-icon absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="fb-auth-link text-[13px] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="fb-auth-btn mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-opacity disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <span className="text-base">→</span>}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="fb-auth-divider h-px flex-1" />
            <div className="fb-auth-divider h-px flex-1" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="fb-auth-social flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-medium transition-opacity hover:opacity-90"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>
            <button
              type="button"
              className="fb-auth-social flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-medium transition-opacity hover:opacity-90"
            >
              <Apple size={20} />
              Continue with Apple
            </button>
          </div>

          <p className="fb-auth-muted text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="fb-auth-link font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </main>
  );
}
