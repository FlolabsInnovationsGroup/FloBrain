type ProgressBarProps = {
  value: number;
  label: string;
};

export default function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="fb-v2-progress"
      >
        <div className="fb-v2-progress-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums">{value}%</span>
    </div>
  );
}
