import type { Metadata } from "next";

import { MyTasksScreen } from "@/components/v2/tasks/MyTasksScreen";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function MyTasksPage() {
  return <MyTasksScreen />;
}
