type MetricCardProps = {
  label: string;
  value: number | string;
};

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="fb-v2-metric-card">
      <p className="text-3xl font-semibold tabular-nums text-[var(--fb-v2-heading)]">{value}</p>
      <h3 className="max-w-36 text-xs leading-snug text-[var(--fb-v2-text-muted)]">{label}</h3>
    </article>
  );
}
