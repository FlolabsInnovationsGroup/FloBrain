"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";

import { ChoiceGroup } from "@/components/v2/form/ChoiceGroup";
import { CollapsibleSection } from "@/components/v2/form/CollapsibleSection";
import { FormField, fieldControlProps } from "@/components/v2/form/FormField";
import { MemberPicker } from "@/components/v2/form/MemberPicker";
import {
  CREATABLE_TASK_STATUSES,
  CREATE_TASK_FIELD_ORDER,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_LABELS,
  emptyCreateTaskForm,
  todayISO,
  toCreateTaskInput,
  validateCreateTask,
  type CreateTaskErrors,
  type CreateTaskField,
  type CreateTaskFormState,
} from "@/lib/tasks";
import type { CreateTaskInput, TaskStatus } from "@/types/task";
import type { TaskFormOptions } from "./mockTaskOptions";

import "./CreateTaskForm.css";

type DetailSectionField =
  | "objective"
  | "context"
  | "requirements"
  | "steps"
  | "deliverables"
  | "acceptanceCriteria";

const DETAIL_SECTIONS: readonly {
  field: DetailSectionField;
  title: string;
  placeholder: string;
}[] = [
  { field: "objective", title: "Objective", placeholder: "What should this task achieve?" },
  { field: "context", title: "Context", placeholder: "Background the assignee needs to know" },
  { field: "requirements", title: "Requirements", placeholder: "One requirement per line" },
  { field: "steps", title: "Steps", placeholder: "One step per line" },
  { field: "deliverables", title: "Deliverables", placeholder: "One deliverable per line" },
  {
    field: "acceptanceCriteria",
    title: "Acceptance criteria",
    placeholder: "One criterion per line",
  },
];

type CreateTaskFormProps = {
  options: TaskFormOptions;
  /** Called with the validated payload. The form itself never saves anything. */
  onSubmit: (input: CreateTaskInput) => void;
  onCancel: () => void;
};

export function CreateTaskForm({ options, onSubmit, onCancel }: CreateTaskFormProps) {
  const [form, setForm] = useState<CreateTaskFormState>(emptyCreateTaskForm);
  const [errors, setErrors] = useState<CreateTaskErrors>({});

  function update<K extends keyof CreateTaskFormState>(field: K, value: CreateTaskFormState[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => (field in previous ? { ...previous, [field]: undefined } : previous));
  }

  function handleProjectChange(projectId: string) {
    const project = options.projects.find((item) => item.id === projectId);
    setForm((previous) => ({
      ...previous,
      projectId,
      // Prefill only what the user has not chosen yet.
      teamId: previous.teamId || project?.teamId || "",
      projectManagerId: previous.projectManagerId || project?.projectManagerId || "",
    }));
    setErrors((previous) => ({
      ...previous,
      projectId: undefined,
      ...(project?.teamId && !form.teamId ? { teamId: undefined } : {}),
      ...(project?.projectManagerId && !form.projectManagerId
        ? { projectManagerId: undefined }
        : {}),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCreateTask(form);
    setErrors(nextErrors);

    const firstInvalid = CREATE_TASK_FIELD_ORDER.find((field) => nextErrors[field]);
    if (firstInvalid) {
      (event.currentTarget.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    onSubmit(toCreateTaskInput(form));
  }

  function control(field: CreateTaskField, required = true) {
    return { name: field, ...fieldControlProps(`task-${field}`, errors[field], required) };
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="fb-v2-task-form" aria-label="Create task">
      <FormField id="task-title" label="Task name" error={errors.title}>
        <input
          {...control("title")}
          className="fb-v2-task-input"
          placeholder="e.g. Build onboarding flow"
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
        />
      </FormField>

      <FormField id="task-projectId" label="Project" error={errors.projectId}>
        <div className="fb-v2-task-select">
          <select
            {...control("projectId")}
            className="fb-v2-task-input"
            value={form.projectId}
            onChange={(event) => handleProjectChange(event.target.value)}
          >
            <option value="">Choose a project</option>
            {options.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </FormField>

      <div className="fb-v2-task-row">
        <FormField
          id="task-projectManagerId"
          label="Project manager"
          error={errors.projectManagerId}
        >
          <div className="fb-v2-task-select">
            <select
              {...control("projectManagerId")}
              className="fb-v2-task-input"
              value={form.projectManagerId}
              onChange={(event) => update("projectManagerId", event.target.value)}
            >
              <option value="">Choose a manager</option>
              {options.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </div>
        </FormField>

        <FormField id="task-dueDate" label="Target due date" error={errors.dueDate}>
          <input
            {...control("dueDate")}
            type="date"
            className="fb-v2-task-input"
            data-empty={form.dueDate === ""}
            min={todayISO()}
            value={form.dueDate}
            onChange={(event) => update("dueDate", event.target.value)}
          />
        </FormField>
      </div>

      <FormField id="task-teamId" label="Team" error={errors.teamId}>
        <div className="fb-v2-task-select">
          <select
            {...control("teamId")}
            className="fb-v2-task-input"
            value={form.teamId}
            onChange={(event) => update("teamId", event.target.value)}
          >
            <option value="">Choose a team</option>
            {options.teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </FormField>

      <FormField id="task-description" label="Description" error={errors.description}>
        <textarea
          {...control("description")}
          className="fb-v2-task-input fb-v2-task-textarea"
          placeholder="Briefly describe the task"
          rows={3}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </FormField>

      <div className="fb-v2-task-sections">
        {DETAIL_SECTIONS.map((section) => {
          const id = `task-${section.field}`;
          return (
            <CollapsibleSection
              key={section.field}
              title={section.title}
              filled={form[section.field].trim().length > 0}
            >
              <textarea
                id={id}
                name={section.field}
                aria-label={section.title}
                className="fb-v2-task-input fb-v2-task-textarea"
                placeholder={section.placeholder}
                rows={4}
                value={form[section.field]}
                onChange={(event) => update(section.field, event.target.value)}
              />
            </CollapsibleSection>
          );
        })}
      </div>

      <div className="fb-v2-task-row fb-v2-task-row--meta">
        <ChoiceGroup
          name="priority"
          legend="Priority"
          value={form.priority}
          options={TASK_PRIORITY_OPTIONS}
          onChange={(value) => update("priority", value)}
        />

        <div className="fb-v2-task-status">
          <FormField id="task-status" label="Status">
            <div className="fb-v2-task-select">
              <select
                id="task-status"
                name="status"
                className="fb-v2-task-input"
                data-tone={form.status}
                value={form.status}
                onChange={(event) => update("status", event.target.value as TaskStatus)}
              >
                {CREATABLE_TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </FormField>
        </div>
      </div>

      <MemberPicker
        label="Add members"
        options={options.people}
        selectedIds={form.assigneeIds}
        onChange={(ids) => update("assigneeIds", ids)}
      />

      <div className="fb-v2-task-actions">
        <button type="button" className="fb-v2-task-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="fb-v2-task-btn">
          Create Task
        </button>
      </div>
    </form>
  );
}
