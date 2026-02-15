"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/layout/card";
import { Label } from "@/components/layout/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    // TODO: Integrate with your auth provider's password reset API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-zinc-950 to-purple-900 flex items-center justify-center p-4 sm:p-8 lg:p-24">
      <div className="w-full max-w-md">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
              Reset your password
            </CardTitle>
            <CardDescription className="text-zinc-300">
              Enter your email and we&apos;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isSubmitted ? (
              <>
                <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-center">
                  <p className="text-green-400 text-sm">
                    Check your inbox at <span className="font-medium text-white">{email}</span> for a
                    password reset link.
                  </p>
                </div>
                <Link href="/signin" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back to Sign In
                  </Button>
                </Link>
                <p className="text-center text-sm text-zinc-400">
                  Didn&apos;t receive the email?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
                  >
                    Try again
                  </button>
                </p>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>

                <Link
                  href="/signin"
                  className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
