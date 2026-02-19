import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar"; // Import it here

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
        <div className="min-h-screen flex flex-col">
          <Navbar /> {/* Now it will show on the landing page! */}
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
