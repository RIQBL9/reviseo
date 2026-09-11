import type { Tables } from "@/lib/types/database";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { GCSE_GRADES } from "@/lib/subjects";
import { cn } from "@/lib/utils";

export function GradesStep({
  selectedSubjects,
  grades,
  onChange,
}: {
  selectedSubjects: Tables<"subjects">[];
  grades: Record<string, number | null>;
  onChange: (subjectId: string, grade: number | null) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">Set your target grades</h2>
      <p className="mt-2 text-ink-muted">Optional, but it helps us show how close you are to your goal.</p>

      <div className="mt-6 space-y-3">
        {selectedSubjects.map((subject) => {
          const Icon = getSubjectIcon(subject.icon);
          const theme = getSubjectTheme(subject.color_theme);
          const current = grades[subject.id] ?? null;

          return (
            <div key={subject.id} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex size-9 items-center justify-center rounded-xl", theme.soft)}>
                  <Icon className={cn("size-4.5", theme.base.split(" ")[0])} strokeWidth={2.25} />
                </div>
                <p className="font-bold text-ink">{subject.name}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {GCSE_GRADES.map((grade) => {
                  const isSelected = current === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => onChange(subject.id, isSelected ? null : grade)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                        isSelected
                          ? "border-brand bg-brand text-white"
                          : "border-border bg-surface text-ink-muted hover:border-brand/40",
                      )}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
