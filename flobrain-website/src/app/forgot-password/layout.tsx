import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/forgot-password",
  title: "Reset Password",
  description: "Reset the password for your FloBrain account.",
  robots: { index: false, follow: true },
});

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
