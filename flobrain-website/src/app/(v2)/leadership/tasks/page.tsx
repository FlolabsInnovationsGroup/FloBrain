import type { Metadata } from "next";
import { ViewTasksScreen } from "@/components/v2/tasks/ViewTasksScreen";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function LeadershipTasksPage() {
  return <ViewTasksScreen />;
}
