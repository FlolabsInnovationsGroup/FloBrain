"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fb-notfound-page flex min-h-[calc(100dvh-10rem)] w-full flex-1 items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="fb-notfound-card rounded-2xl p-8 text-center dark:backdrop-blur-md">
          <div
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "var(--fb-notfound-icon-bg)" }}
          >
            <FileQuestion
              className="h-8 w-8"
              style={{ color: "var(--fb-notfound-icon)" }}
            />
          </div>

          <h1
            className="mb-2 text-6xl font-bold"
            style={{ color: "var(--fb-notfound-title)" }}
          >
            404
          </h1>
          <h2
            className="mb-2 text-2xl font-bold"
            style={{ color: "var(--fb-notfound-title)" }}
          >
            Page Not Found
          </h2>
          <p className="mb-6" style={{ color: "var(--fb-notfound-body)" }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#9333ea] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#7c3aed]"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="fb-notfound-btn-secondary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
