<<<<<<< HEAD
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock, EyeOff, Eye, Apple, ArrowLeft } from "lucide-react";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/input";
import { Label } from "@/components/layout/label";
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
    <main className="min-h-screen fb-auth-bg flex flex-col items-center justify-center p-4 sm:p-8 lg:p-24 relative overflow-hidden">
      {/* Back button - top left */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#8B65C5]/80 hover:bg-[#8B65C5] text-white transition-colors"
      >
        <ArrowLeft size={20} />
      </Link>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.15)_0%,_transparent_60%)]" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Form Card - light lavender */}
        <div className="w-full fb-auth-card rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header - inside card */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--fb-auth-heading)" }}>
              Welcome Back!
            </h1>
            <p className="text-sm" style={{ color: "var(--fb-auth-text)" }}>
              Sign in to your{" "}
              <span className="font-semibold" style={{ color: "var(--fb-auth-heading)" }}>
                FloBrain
              </span>{" "}
              account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-800 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@email.com"
                  className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-12 focus-visible:ring-2 focus-visible:ring-[#6B46C1]/50 focus-visible:border-[#6B46C1]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-800 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-12 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-12 focus-visible:ring-2 focus-visible:ring-[#6B46C1]/50 focus-visible:border-[#6B46C1]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm font-medium text-[#6B46C1] hover:text-[#5B36B1] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-semibold rounded-full shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-95"
              style={{ background: "var(--fb-auth-btn)" }}
            >
              {loading ? "Signing in…" : "Sign In"}
              <span className="text-lg">→</span>
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-300" />
            <span className="text-sm text-zinc-500">Or continue with</span>
            <div className="flex-1 h-px bg-zinc-300" />
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-zinc-300 bg-white/80 text-zinc-800 hover:bg-white hover:border-zinc-400 rounded-lg flex items-center justify-center gap-3 font-medium"
            >
              <FcGoogle size={20} />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-zinc-300 bg-white/80 text-zinc-800 hover:bg-white hover:border-zinc-400 rounded-lg flex items-center justify-center gap-3 font-medium"
            >
              <Apple size={20} className="text-zinc-800" />
              Continue with Apple
            </Button>
          </div>

          <p className="text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#6B46C1] hover:text-[#5B36B1] transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </main>
  );
}
=======
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
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #070014 100%)" }}
    >
      {/* Radial glow background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="w-[480px] h-[480px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col gap-6">

        {/* Title */}
        <h1
          className="text-[28px] sm:text-[32px] font-bold text-center"
          style={{ color: "#EC4899" }}
        >
          Welcome Back
        </h1>

        {/* Card */}
        <div
          className="w-full rounded-2xl p-5 sm:p-6 flex flex-col gap-5"
          style={{
            background: "rgba(22, 10, 40, 0.85)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            boxShadow: "0 0 40px rgba(124, 58, 237, 0.12), 0 4px 24px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
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
                  className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-all disabled:opacity-60"
                  style={{
                    background: "#e8e3f0",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
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
                  className="w-full h-12 pl-10 pr-12 rounded-xl text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-all disabled:opacity-60"
                  style={{
                    background: "#e8e3f0",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex items-center justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-[13px] font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 mt-1 transition-opacity disabled:opacity-60 cursor-pointer"
              style={{
                background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 0 24px rgba(168, 85, 247, 0.5), 0 4px 16px rgba(124, 58, 237, 0.4)",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <span className="text-base">→</span>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="w-full h-12 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-3 transition-colors hover:opacity-90"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full h-12 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-3 transition-colors hover:opacity-90"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Apple size={20} className="text-white" />
              Continue with Apple
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold transition-colors"
              style={{ color: "#a855f7" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </main>
  );
}
>>>>>>> origin/main
