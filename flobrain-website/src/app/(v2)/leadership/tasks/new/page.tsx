import type { Metadata } from "next";
import { CreateTaskScreen } from "@/components/v2/tasks/CreateTaskScreen";

export const metadata: Metadata = {
  title: "Create Task",
};

export default function CreateTaskPage() {
  return <CreateTaskScreen />;
}
