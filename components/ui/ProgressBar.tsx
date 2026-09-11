import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  trackClassName,
  barClassName,
  label,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      className={cn("w-full", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cn("h-2.5 w-full overflow-hidden rounded-pill bg-surface-muted", trackClassName)}>
        <div
          className={cn("h-full rounded-pill bg-brand transition-[width] duration-700 ease-out", barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
