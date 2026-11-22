"use client";

import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/input";
import { Label } from "@/components/layout/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/layout/dialog";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    // TODO: Integrate with auth provider's password reset API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEmail("");
      setIsSubmitted(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={true}
        className="bg-[#CABEE8]/95 border-zinc-200/50 shadow-2xl max-w-md p-0 overflow-hidden rounded-2xl [&_[data-slot=dialog-close]]:text-zinc-600 [&_[data-slot=dialog-close]]:hover:text-zinc-800"
      >
        <div className="p-6 sm:p-8">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-[#5F298F]">
              Reset your password
            </DialogTitle>
            <DialogDescription className="text-zinc-600 text-sm mt-2">
              Enter your email and we&apos;ll send you a link to reset your password
            </DialogDescription>
          </DialogHeader>

          {isSubmitted ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-green-100 border border-green-200 p-4 text-center">
                <p className="text-green-800 text-sm">
                  Check your inbox at <span className="font-medium text-zinc-900">{email}</span> for a
                  password reset link.
                </p>
              </div>
              <Button
                onClick={() => handleClose(false)}
                variant="outline"
                className="w-full h-12 border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                <ArrowLeft size={18} />
                Back to Sign In
              </Button>
              <p className="text-center text-sm text-zinc-600">
                Didn&apos;t receive the email?{" "}
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="font-semibold text-[#6B46C1] hover:text-[#5B36B1] transition-colors"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-zinc-800 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-12 focus-visible:ring-2 focus-visible:ring-[#6B46C1]/50 focus-visible:border-[#6B46C1]"
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
                className="w-full h-12 bg-[#6B46C1] hover:bg-[#5B36B1] text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? "Sending..." : "Send reset link"}
                <span className="text-lg">→</span>
              </Button>

              <button
                type="button"
                onClick={() => handleClose(false)}
                className="flex items-center justify-center gap-2 text-sm text-zinc-600 hover:text-zinc-800 transition-colors w-full"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
