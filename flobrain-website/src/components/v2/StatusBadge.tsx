export type StatusVariant =
  | "active"
  | "pending"
  | "blocked"
  | "overdue"
  | "inactive"
  | "completed";

const badgeClasses: Record<StatusVariant, string> = {
  active: "bg-[var(--fb-v2-success-subtle)] text-[var(--fb-v2-success)]",
  completed: "bg-[var(--fb-v2-success-subtle)] text-[var(--fb-v2-success)]",
  pending: "bg-[var(--fb-v2-warning-subtle)] text-[var(--fb-v2-warning)]",
  // Blocked and overdue have different meanings but share the error palette.
  blocked: "bg-[var(--fb-v2-error-subtle)] text-[var(--fb-v2-error)]",
  overdue: "bg-[var(--fb-v2-error-subtle)] text-[var(--fb-v2-error)]",
  inactive: "bg-[var(--fb-v2-accent-subtle)] text-[var(--fb-v2-inactive)]",
};

type StatusBadgeProps = {
  variant: StatusVariant;
  label: string;
};

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${badgeClasses[variant]}`}
    >
      {label}
    </span>
  );
}
