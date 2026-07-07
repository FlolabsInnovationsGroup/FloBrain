import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare FloBrain pricing plans for hobbyists, startups, and enterprises. Flexible tiers for AI workflow orchestration, persistent memory, and device intelligence.",
};

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}