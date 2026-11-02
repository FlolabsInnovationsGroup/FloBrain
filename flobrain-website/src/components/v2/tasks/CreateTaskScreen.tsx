"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { CreateTaskInput } from "@/types/task";
import { CreateTaskForm } from "./CreateTaskForm";
import { mockTaskFormOptions } from "./mockTaskOptions";

/**
 * Create Task page content. This is the only place that knows about routing and saving.
 * When the backend exists, replace the demo handler with a `useMutation` calling
 * `api.createTask` and navigate to the task list on success. The form needs no change.
 */
export function CreateTaskScreen() {
  const router = useRouter();
  const [notice, setNotice] = useState("");

  function handleSubmit(input: CreateTaskInput) {
    setNotice(
      `Demo only: "${input.title}" passed validation but was not saved. ` +
        "Tasks can be created once the backend is connected."
    );
  }

  return (
    <div className="fb-v2-task-page">
      <div className="fb-v2-task-card">
        <h2 className="fb-v2-task-heading">Create Task</h2>
        {notice ? (
          <p role="status" className="fb-v2-task-notice">
            {notice}
          </p>
        ) : null}
        <CreateTaskForm
          options={mockTaskFormOptions}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
