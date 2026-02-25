"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock, EyeOff, Eye, User, Apple } from "lucide-react";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/input";
import { Label } from "@/components/layout/label";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
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
    <main className="min-h-screen bg-[#2E0A4E] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-24 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.15)_0%,_transparent_60%)]" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Header - outside card */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#8A2BE2] mb-2">Create Account</h1>
          <p className="text-zinc-400 text-sm">
            Join <span className="font-semibold text-[#8A2BE2]">FloBrain</span> and start your journey
          </p>
        </div>

        {/* Form Card - light lavender */}
        <div className="w-full bg-[#CABEE8]/90 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-800 font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-12 focus-visible:ring-2 focus-visible:ring-[#6B46C1]/50 focus-visible:border-[#6B46C1]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-800 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
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
                  placeholder="Create a password"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-zinc-800 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 pr-12 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-12 focus-visible:ring-2 focus-visible:ring-[#6B46C1]/50 focus-visible:border-[#6B46C1]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#6B46C1] hover:bg-[#5B36B1] text-white font-semibold rounded-lg shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? "Creating account…" : "Create Account"}
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
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-[#6B46C1] hover:text-[#5B36B1] transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
