import type { Metadata } from "next";
import LeadershipDashboardPanel from "@/components/v2/LeadershipDashboardPanel";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function LeadershipDashboardPage() {
  return <LeadershipDashboardPanel />;
}
