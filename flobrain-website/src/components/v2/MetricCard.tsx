
type MetricCardProps = {
  label: string;
  value: number | string;
};

export default function MetricCard({
  label,
  value,
}: MetricCardProps) {
  return (
    <article className="fb-v2-card flex min-h-28 flex-col items-center justify-center gap-2 text-center">
      <p className="text-2xl font-semibold tabular-nums text-[var(--fb-v2-heading)]">
        {value}
      </p>
      <h3 className="text-sm text-[var(--fb-v2-text-muted)]">
        {label}
      </h3>
    </article>
  );
}
