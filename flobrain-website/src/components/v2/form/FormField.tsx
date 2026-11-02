import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
  children: ReactNode;
};

/** Label, control slot and error message. Pair with `fieldControlProps` on the control. */
export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="fb-v2-task-field">
      <label htmlFor={id} className="fb-v2-task-label">
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
