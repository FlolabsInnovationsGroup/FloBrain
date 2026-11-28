import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/signin",
  title: "Sign In",
  description: "Sign in to your FloBrain account to manage your devices, workflows, and AI memory.",
  robots: { index: false, follow: true },
});

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
