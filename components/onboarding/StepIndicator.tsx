import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  step: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ step, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
        <span>
          Step {Math.min(step + 1, totalSteps)} of {totalSteps}
        </span>
        <span>{labels[step]}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-pill bg-surface-muted transition-colors duration-300",
              i <= step && "bg-brand",
            )}
          />
        ))}
      </div>
    </div>
  );
}
