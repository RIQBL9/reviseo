import { GraduationCap } from "lucide-react";
import type { YearGroup } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const OPTIONS: { value: YearGroup; label: string; description: string }[] = [
  { value: "year_10", label: "Year 10", description: "Starting your GCSE courses" },
  { value: "year_11", label: "Year 11", description: "Sitting your exams this year" },
];

export function YearGroupStep({
  value,
  onChange,
}: {
  value: YearGroup | null;
  onChange: (v: YearGroup) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">What year are you in?</h2>
      <p className="mt-2 text-ink-muted">This helps us tailor your revision timeline.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-start gap-3 rounded-card border-2 p-5 text-left transition-all",
                selected
                  ? "border-brand bg-brand/5 shadow-[0_8px_24px_-12px_rgba(79,70,229,0.4)]"
                  : "border-border bg-surface hover:border-brand/30",
              )}
            >
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl",
                  selected ? "bg-brand text-white" : "bg-surface-muted text-ink-muted",
                )}
              >
                <GraduationCap className="size-5.5" />
              </div>
              <div>
                <p className="font-bold text-ink">{option.label}</p>
                <p className="text-sm text-ink-muted">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
