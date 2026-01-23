"use client";

import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from 'react-icons/fc'; <FcGoogle size={24} />
import { Mail, Lock, EyeOff, Eye, Apple } from "lucide-react";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/layout/card";
import { Label } from "@/components/layout/label";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-zinc-950 to-purple-900 flex items-center justify-center p-4 sm:p-8 lg:p-24">
      <div className="w-full max-w-md">
        {/* Card */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
              Welcome Back!
            </CardTitle>
            <CardDescription className="text-zinc-300">
              Sign in to your FLOBRAIN account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
                  placeholder="Enter your password"
                  className="pl-10 pr-12 bg-white/10 border-white/30 text-white placeholder-zinc-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg shadow-xl">
              Sign In →
            </Button>

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

            {/* Register Link */}
            <p className="text-center text-sm text-zinc-400">
              Don&apos;t have an account?{" "}  {/* or "Don't have an account?" with &apos; */}
              <Link
                href="/register"
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
              >
                Register for free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
