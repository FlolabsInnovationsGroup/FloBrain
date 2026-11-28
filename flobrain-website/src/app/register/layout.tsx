import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/register",
  title: "Create Your Account",
  description:
    "Create a free FloBrain account and start building smarter AI-enabled devices and apps with workflow orchestration and persistent memory.",
});

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
