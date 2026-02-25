"use client";

import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock, EyeOff, Eye, User, Apple, Loader2 } from "lucide-react";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/input";
import { Label } from "@/components/layout/label";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[#0f0a1a]">
      {/* Dark radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(88,28,135,0.25)_0%,_rgba(15,10,26,0.9)_50%,_#0f0a1a_100%)]" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Title above card - vibrant pink-to-purple gradient */}
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#a78bfa] bg-clip-text text-transparent">
          Create Account
        </h1>

        {/* Form Card - dark with pinkish-purple glow */}
        <div className="w-full rounded-2xl p-6 sm:p-8 space-y-6 bg-[#1a1525]/90 border border-[#6b21a8]/30 shadow-[0_0_40px_rgba(147,51,234,0.15),0_0_80px_rgba(126,34,206,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-400 font-medium text-sm">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-11 pr-4 bg-white text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 border-0 shadow-inner focus-visible:ring-2 focus-visible:ring-[#a78bfa]/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 font-medium text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-11 pr-4 bg-white text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 border-0 shadow-inner focus-visible:ring-2 focus-visible:ring-[#a78bfa]/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 font-medium text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-12 bg-white text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 border-0 shadow-inner focus-visible:ring-2 focus-visible:ring-[#a78bfa]/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-zinc-400 font-medium text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-12 bg-white text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 border-0 shadow-inner focus-visible:ring-2 focus-visible:ring-[#a78bfa]/50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] shadow-lg shadow-[#7c3aed]/40 hover:opacity-95 disabled:opacity-60 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <span className="text-lg">→</span>
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-zinc-500">Or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              className="w-full h-12 rounded-xl border border-white/20 bg-[#2a2139] text-white hover:bg-[#352a45] flex items-center justify-center gap-3 font-medium"
            >
              <FcGoogle size={20} />
              Continue with Google
            </Button>
            <Button
              type="button"
              className="w-full h-12 rounded-xl border border-white/20 bg-[#2a2139] text-white hover:bg-[#352a45] flex items-center justify-center gap-3 font-medium"
            >
              <Apple size={20} className="text-white" />
              Continue with Apple
            </Button>
          </div>

          <p className="text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold bg-gradient-to-r from-[#e879f9] to-[#a78bfa] bg-clip-text text-transparent hover:opacity-90 transition-opacity"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
