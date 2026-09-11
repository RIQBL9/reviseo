import { Check } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { cn } from "@/lib/utils";

export function SubjectsStep({
  subjects,
  selected,
  onToggle,
}: {
  subjects: Tables<"subjects">[];
  selected: Set<string>;
  onToggle: (subjectId: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">Choose your subjects</h2>
      <p className="mt-2 text-ink-muted">Select every GCSE subject you want to revise on Reviseo.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {subjects.map((subject) => {
          const Icon = getSubjectIcon(subject.icon);
          const theme = getSubjectTheme(subject.color_theme);
          const isSelected = selected.has(subject.id);
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => onToggle(subject.id)}
              aria-pressed={isSelected}
              className={cn(
                "relative flex flex-col items-start gap-2.5 rounded-2xl border-2 p-4 text-left transition-all",
                isSelected ? "border-brand bg-brand/5" : "border-border bg-surface hover:border-brand/30",
              )}
            >
              {isSelected && (
                <div className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
              )}
              <div className={cn("flex size-10 items-center justify-center rounded-xl", theme.soft)}>
                <Icon className={cn("size-5", theme.base.split(" ")[0])} strokeWidth={2.25} />
              </div>
              <p className="text-sm font-bold leading-tight text-ink">{subject.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
