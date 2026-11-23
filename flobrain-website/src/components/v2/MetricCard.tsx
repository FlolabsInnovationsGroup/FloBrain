
type MetricCardProps = {
  label: string;
  value: number | string;
  description: string;
};

export default function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <article className="fb-v2-metric-card flex flex-col items-center justify-center gap-2 text-center">
      <h3 className="text-xs font-medium uppercase text-[var(--fb-v2-text-muted)]">
        {label}
      </h3>

      <p className="text-2xl font-semibold tabular-nums text-[var(--fb-v2-heading)]">
        {value}
      </p>

      <p className="text-xs text-[var(--fb-v2-text-muted)]">
        {description}
      </p>
    </article>
  );
}
