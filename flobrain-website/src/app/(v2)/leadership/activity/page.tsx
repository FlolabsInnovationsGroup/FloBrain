
import type { Metadata } from "next";
import LeadershipActivityLogPanel from "@/components/v2/LeadershipActivityLogPanel";

export const metadata: Metadata = {
  title: "Activity Logs",
};

export default function LeadershipActivityPage() {
  return <LeadershipActivityLogPanel />;
}
