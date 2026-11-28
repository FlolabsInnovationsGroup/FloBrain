import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { pricingSchema } from "@/lib/schema";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/pricing",
  title: "Pricing",
  description:
    "Compare FloBrain pricing plans for hobbyists, startups, and enterprises. Flexible tiers for AI workflow orchestration, persistent memory, and device intelligence.",
});

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JsonLd data={pricingSchema()} />
      {children}
    </>
  );
}
