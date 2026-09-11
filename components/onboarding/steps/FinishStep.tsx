import { PartyPopper } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function FinishStep({
  selectedSubjects,
  examBoards,
  boardSelection,
  grades,
  onFinish,
  pending,
  error,
}: {
  selectedSubjects: Tables<"subjects">[];
  examBoards: Tables<"exam_boards">[];
  boardSelection: Record<string, string>;
  grades: Record<string, number | null>;
  onFinish: () => void;
  pending: boolean;
  error?: string;
}) {
  const boardName = (id?: string) => examBoards.find((b) => b.id === id)?.name ?? "—";

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-xp-soft">
          <PartyPopper className="size-8 text-amber-500" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">You&apos;re all set!</h2>
        <p className="mt-2 text-ink-muted">Here&apos;s your revision setup — you can change any of this later.</p>
      </div>

      <div className="mt-6 space-y-2.5">
        {selectedSubjects.map((subject) => {
          const Icon = getSubjectIcon(subject.icon);
          const theme = getSubjectTheme(subject.color_theme);
          const grade = grades[subject.id];
          return (
            <div key={subject.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
              <div className={cn("flex size-9 items-center justify-center rounded-xl", theme.soft)}>
                <Icon className={cn("size-4.5", theme.base.split(" ")[0])} strokeWidth={2.25} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">{subject.name}</p>
                <p className="text-xs text-ink-muted">{boardName(boardSelection[subject.id])}</p>
              </div>
              {grade && (
                <div className="flex size-8 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                  {grade}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
          {error}
        </div>
      )}

      <Button onClick={onFinish} fullWidth size="lg" loading={pending} className="mt-6">
        Go to my dashboard
      </Button>
    </div>
  );
}
