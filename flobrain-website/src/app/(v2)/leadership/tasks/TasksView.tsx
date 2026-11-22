"use client";

import { useQuery } from "@tanstack/react-query";
import { ViewTasksScreen } from "@/components/v2/tasks/ViewTasksScreen";
import { fetchTasksCreatedByMe, v2Keys, type AssignedTaskApi } from "@/lib/v2-api";
import type { Task } from "@/types/task";

function mapApiTask(t: AssignedTaskApi): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    project: { id: String(t.board.id), name: t.board.name },
    team: { id: String(t.board.id), name: t.board.name },
    projectManager: { id: "", name: "" },
    createdBy: { id: t.created_by, name: "" },
    assignedTo: t.assigned_to ? [t.assigned_to] : [],
    dueDate: t.due_date ?? "",
    priority: t.priority,
    status: t.status,
    sections: {
      objective: "",
      context: "",
      requirements: [],
      steps: [],
      deliverables: [],
      acceptanceCriteria: [],
    },
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

export function TasksView() {
  const { data, isLoading } = useQuery({
    queryKey: v2Keys.tasksCreatedByMe,
    queryFn: fetchTasksCreatedByMe,
  });

  const tasks = (data ?? []).map(mapApiTask);

  return (
    <ViewTasksScreen
      tasks={tasks}
      projectLabel={isLoading ? "Loading…" : "ALL BOARDS"}
    />
  );
}
