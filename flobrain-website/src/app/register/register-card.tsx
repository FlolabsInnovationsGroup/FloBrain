"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Apple, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const RegisterCard = memo(function RegisterCard() {
  const router = useRouter();
  const { register: doRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const result = await doRegister({ name, email, password });
      if (result.ok) {
        router.push("/dashboard");
        return;
      }
      setError(result.error ?? "Registration failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl border border-violet-500/20 bg-[#160a28]/95 p-5 shadow-[0_0_40px_rgba(124,58,237,0.12),0_4px_24px_rgba(0,0,0,0.4)] sm:p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-900/30 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-white/80">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-12 w-full rounded-xl border border-violet-500/15 bg-[#e8e3f0] pl-10 pr-4 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-violet-500/35"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              type="email"
              placeholder="johndoe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-violet-500/15 bg-[#e8e3f0] pl-10 pr-4 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-violet-500/35"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-white/80">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-violet-500/15 bg-[#e8e3f0] pl-10 pr-12 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-violet-500/35"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-password" className="text-sm font-medium text-white/80">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-violet-500/15 bg-[#e8e3f0] pl-10 pr-12 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-violet-500/35"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? "Hide confirm password" : "Show confirm password"
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[15px] font-semibold text-white shadow-[0_0_24px_rgba(168,85,247,0.5),0_4px_16px_rgba(124,58,237,0.4)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
          {!loading && <span className="text-base">→</span>}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.06] text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.06] text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          <Apple size={20} className="text-white" />
          Continue with Apple
        </button>
      </div>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-semibold text-purple-400 transition-colors hover:text-purple-300"
        >
          Login
        </Link>
      </p>
    </div>
  );
});
