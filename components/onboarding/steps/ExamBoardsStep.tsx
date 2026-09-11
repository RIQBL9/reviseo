import type { Tables } from "@/lib/types/database";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { cn } from "@/lib/utils";

export function ExamBoardsStep({
  selectedSubjects,
  examBoards,
  subjectExamBoards,
  selection,
  onChange,
}: {
  selectedSubjects: Tables<"subjects">[];
  examBoards: Tables<"exam_boards">[];
  subjectExamBoards: Tables<"subject_exam_boards">[];
  selection: Record<string, string>;
  onChange: (subjectId: string, examBoardId: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">Pick your exam board</h2>
      <p className="mt-2 text-ink-muted">
        Choose the exam board for each subject so revision matches your real specification.
      </p>

      <div className="mt-6 space-y-4">
        {selectedSubjects.map((subject) => {
          const Icon = getSubjectIcon(subject.icon);
          const theme = getSubjectTheme(subject.color_theme);
          const availableBoardIds = new Set(
            subjectExamBoards.filter((seb) => seb.subject_id === subject.id).map((seb) => seb.exam_board_id),
          );
          const availableBoards = examBoards.filter((board) => availableBoardIds.has(board.id));

          return (
            <div key={subject.id} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex size-9 items-center justify-center rounded-xl", theme.soft)}>
                  <Icon className={cn("size-4.5", theme.base.split(" ")[0])} strokeWidth={2.25} />
                </div>
                <p className="font-bold text-ink">{subject.name}</p>
              </div>

              {availableBoards.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">No exam boards available for this subject yet.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableBoards.map((board) => {
                    const isSelected = selection[subject.id] === board.id;
                    return (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => onChange(subject.id, board.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "rounded-pill border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors",
                          isSelected
                            ? "border-brand bg-brand text-white"
                            : "border-border bg-surface text-ink-muted hover:border-brand/40",
                        )}
                      >
                        {board.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
