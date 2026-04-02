import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/layout/AppChrome";
import { AuthProviderWrapper } from "@/components/providers/AuthProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Caipo Website",
  description: "Advanced Interface",
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
          <div className="flex min-h-screen flex-col">
            <AppChrome>{children}</AppChrome>
          </div>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
