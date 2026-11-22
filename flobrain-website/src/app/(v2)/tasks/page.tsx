import type { Metadata } from "next";
import { MyTasksView } from "./MyTasksView";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function MyTasksPage() {
  return <MyTasksView />;
}
