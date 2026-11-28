import type { Metadata } from "next";
import "./home-dashboard.css";
import { HomeDashboard } from "./home-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: true },
};

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <HomeDashboard />
    </div>
  );
}
