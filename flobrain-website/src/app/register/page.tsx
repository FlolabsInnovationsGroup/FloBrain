"use client";

import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock, EyeOff, Eye, User, Apple, Loader2 } from "lucide-react";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/layout/card";
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
      // Handle password mismatch
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Handle successful registration (redirect, etc.)
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-zinc-950 to-purple-900 flex items-center justify-center p-4 sm:p-8 lg:p-24">
      <div className="w-full max-w-md">
        {/* Card */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-zinc-300">
              Sign up for free to get started with FLOBRAIN
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder-zinc-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent h-12"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder-zinc-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-12 bg-white/10 border-white/30 text-white placeholder-zinc-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/10"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-10 pr-12 bg-white/10 border-white/30 text-white placeholder-zinc-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent h-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Terms Checkbox - Optional */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 rounded bg-white/10 border-white/30 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  disabled={isSubmitting}
                />
                <Label htmlFor="terms" className="text-sm text-zinc-300 cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-purple-300 hover:text-purple-200 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-purple-300 hover:text-purple-200 underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-semibold text-lg shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account →"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-sm text-zinc-400 px-3">or continue with</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Social Buttons */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-12 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 flex items-center gap-3"
              >
                <FcGoogle size={20} />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 flex items-center gap-3"
              >
                <Apple size={20} />
                Continue with Apple
              </Button>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
