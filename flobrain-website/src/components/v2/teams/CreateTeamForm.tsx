"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import MemberMultiSelect from "./MemberMultiSelect";
import { mockMembers } from "./mockMembers";
import "./CreateTeamForm.css";

type TeamForm = {
  name: string;
  department: string;
  description: string;
  leadId: string;
  coLeadId: string;
  memberIds: number[];
};

type FieldName = "name" | "department" | "leadId" | "coLeadId";
type FormErrors = Partial<Record<FieldName, string>>;

const emptyForm: TeamForm = {
  name: "",
  department: "",
  description: "",
  leadId: "",
  coLeadId: "",
  memberIds: [],
};

function validate(form: TeamForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Enter a team name.";
  if (!form.department.trim()) errors.department = "Enter a department.";
  if (!form.leadId) errors.leadId = "Choose a team lead.";
  if (form.coLeadId && form.coLeadId === form.leadId) {
    errors.coLeadId = "The co-lead must be a different person from the team lead.";
  }
  return errors;
}

type FieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
  children: ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="fb-v2-label fb-v2-form-label">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="fb-v2-field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CreateTeamForm() {
  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState("");

  function update<K extends keyof TeamForm>(field: K, value: TeamForm[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setNotice("");
  }

  // Shared accessibility props so screen readers announce each field's error.
  function errorProps(field: FieldName) {
    return {
      name: field,
      "aria-invalid": errors[field] ? true : undefined,
      "aria-describedby": errors[field] ? `team-${field}-error` : undefined,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    const firstInvalid = (Object.keys(nextErrors) as FieldName[])[0];
    if (firstInvalid) {
      setNotice("");
      (event.currentTarget.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setNotice(
      `Demo only: "${form.name.trim()}" passed validation but was not saved. ` +
        "Teams can be created once the backend is connected."
    );
  }

  const memberOptions = mockMembers.map((member) => (
    <option key={member.id} value={member.id}>
      {member.name}
    </option>
  ));

  return (
    <form noValidate onSubmit={handleSubmit} className="fb-v2-form-card">
      <Field id="team-name" label="Team name" error={errors.name}>
        <input
          id="team-name"
          {...errorProps("name")}
          aria-required="true"
          className="fb-v2-input fb-v2-form-input"
          placeholder="e.g. Wearable Team 1"
          maxLength={80}
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </Field>

      <Field id="team-department" label="Department" error={errors.department}>
        <input
          id="team-department"
          {...errorProps("department")}
          aria-required="true"
          className="fb-v2-input fb-v2-form-input"
          placeholder="e.g. Engineering"
          maxLength={80}
          value={form.department}
          onChange={(event) => update("department", event.target.value)}
        />
      </Field>

      <Field
        id="team-description"
        label={
          <>
            Description <span className="normal-case">- optional</span>
          </>
        }
      >
        <textarea
          id="team-description"
          name="description"
          className="fb-v2-input fb-v2-form-input fb-v2-textarea"
          placeholder="e.g. Builds the wearable companion app"
          maxLength={500}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </Field>

      <div className="fb-v2-field-grid">
        <Field id="team-leadId" label="Assign leadership" error={errors.leadId}>
          <div className="fb-v2-select">
            <select
              id="team-leadId"
              {...errorProps("leadId")}
              aria-required="true"
              className="fb-v2-input fb-v2-form-input fb-v2-select-input"
              value={form.leadId}
              onChange={(event) => update("leadId", event.target.value)}
            >
              <option value="">Select team lead</option>
              {memberOptions}
            </select>
            <ChevronDown size={16} className="fb-v2-select-icon" aria-hidden="true" />
          </div>
        </Field>

        <Field id="team-coLeadId" label="Assign co-lead" error={errors.coLeadId}>
          <div className="fb-v2-select">
            <select
              id="team-coLeadId"
              {...errorProps("coLeadId")}
              className="fb-v2-input fb-v2-form-input fb-v2-select-input"
              value={form.coLeadId}
              onChange={(event) => update("coLeadId", event.target.value)}
            >
              <option value="">No co-lead</option>
              {memberOptions}
            </select>
            <ChevronDown size={16} className="fb-v2-select-icon" aria-hidden="true" />
          </div>
        </Field>
      </div>

      <MemberMultiSelect
        id="team-members"
        label="Add members"
        members={mockMembers}
        selectedIds={form.memberIds}
        onChange={(memberIds) => update("memberIds", memberIds)}
      />

      {notice && (
        <p role="status" className="fb-v2-form-notice">
          {notice}
        </p>
      )}

      <div className="fb-v2-form-actions">
        <Link href="/leadership/dashboard" className="fb-v2-btn-ghost fb-v2-form-button">
          Cancel
        </Link>
        <button type="submit" className="fb-v2-btn-primary fb-v2-form-button">
          Create Team
        </button>
      </div>
    </form>
  );
}
