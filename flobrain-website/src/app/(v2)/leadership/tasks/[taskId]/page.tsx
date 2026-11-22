import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaskDetailsScreen } from "@/components/v2/tasks/TaskDetailsScreen";
import { getMockTask, getMockTasks } from "@/components/v2/tasks/mockTasks";

type TaskDetailsPageProps = {
  params: Promise<{ taskId: string }>;
};

export function generateStaticParams() {
  return getMockTasks().map((task) => ({ taskId: task.id }));
}

export async function generateMetadata({ params }: TaskDetailsPageProps): Promise<Metadata> {
  const { taskId } = await params;
  const task = getMockTask(taskId);
  return {
    title: task ? task.title : "Task Details",
  };
}

export default async function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const { taskId } = await params;
  const task = getMockTask(taskId);
  if (!task) notFound();
  return <TaskDetailsScreen task={task} />;
}
