import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
  children: ReactNode;
  /** When true, keep the label’s casing (Figma uses sentence case for Task description). */
  sentenceCaseLabel?: boolean;
};

/** Label, control slot and error message. Pair with `fieldControlProps` on the control. */
export function FormField({ id, label, error, children, sentenceCaseLabel }: FormFieldProps) {
  return (
    <div className="fb-v2-task-field">
      <label
        htmlFor={id}
        className={
          sentenceCaseLabel ? "fb-v2-task-label fb-v2-task-label--sentence" : "fb-v2-task-label"
        }
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="fb-v2-task-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Accessibility props so a screen reader announces the field's error. */
export function fieldControlProps(id: string, error?: string, required = false) {
  return {
    id,
    "aria-required": required ? true : undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;
}
