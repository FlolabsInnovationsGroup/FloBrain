import type { Metadata } from "next";
import { ActivityLog } from "./components/ActivityLog";

export const metadata: Metadata = {
  title: "Activity Logs",
};

export default function LeadershipActivityPage() {
  return <ActivityLog />;
}
