import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { RootBackground } from "@/components/layout/RootBackground";
import { AuthProviderWrapper } from "@/components/providers/AuthProviderWrapper";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FloBrain",
    template: "%s | FloBrain",
  },
  description:
    "FloBrain is the intelligence layer for AI-enabled devices and apps. Build smarter products with workflow orchestration, persistent memory, and privacy-first AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderWrapper>
          <RootBackground>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </RootBackground>
        </AuthProviderWrapper>
        {GA_MEASUREMENT_ID ? (
          <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
        ) : null}
      </body>
    </html>
  );
}
