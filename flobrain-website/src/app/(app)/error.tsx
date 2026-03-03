"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
          <p className="text-white/60 mb-6">
            An unexpected error occurred. Don&apos;t worry, we&apos;re on it.
          </p>

          {error.message && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-300 font-mono break-words">{error.message}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
