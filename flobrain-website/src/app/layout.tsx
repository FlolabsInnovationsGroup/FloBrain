import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { RootBackground } from "@/components/layout/RootBackground";
import { AuthProviderWrapper } from "@/components/providers/AuthProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

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
      </body>
    </html>
  );
}
