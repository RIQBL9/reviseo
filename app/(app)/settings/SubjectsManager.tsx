"use client";

import { useMemo, useState, useTransition } from "react";
import { X, Plus, Save } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme, GCSE_GRADES } from "@/lib/subjects";
import { updateUserSubjectsAction } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Selection {
  examBoardId: string | null;
  targetGrade: number | null;
}

export function SubjectsManager({
  allSubjects,
  examBoards,
  subjectExamBoards,
  initial,
}: {
  allSubjects: Tables<"subjects">[];
  examBoards: Tables<"exam_boards">[];
  subjectExamBoards: Tables<"subject_exam_boards">[];
  initial: { subjectId: string; examBoardId: string; targetGrade: number | null }[];
}) {
  const originalIds = useMemo(() => new Set(initial.map((i) => i.subjectId)), [initial]);
  const [selections, setSelections] = useState<Record<string, Selection>>(() =>
    Object.fromEntries(initial.map((i) => [i.subjectId, { examBoardId: i.examBoardId, targetGrade: i.targetGrade }])),
  );
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const selectedIds = Object.keys(selections);
  const remainingSubjects = allSubjects.filter((s) => !selections[s.id]);

  function addSubject(subjectId: string) {
    setSelections((prev) => ({ ...prev, [subjectId]: { examBoardId: null, targetGrade: null } }));
    setStatus("idle");
  }

  function removeSubject(subjectId: string) {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[subjectId];
      return next;
    });
    setStatus("idle");
  }

  function updateSelection(subjectId: string, patch: Partial<Selection>) {
    setSelections((prev) => ({ ...prev, [subjectId]: { ...prev[subjectId], ...patch } }));
    setStatus("idle");
  }

  const canSave = selectedIds.every((id) => selections[id].examBoardId);

  function handleSave() {
    const removedSubjectIds = [...originalIds].filter((id) => !selections[id]);
    startTransition(async () => {
      const result = await updateUserSubjectsAction({
        subjects: selectedIds.map((subjectId) => ({
          subjectId,
          examBoardId: selections[subjectId].examBoardId!,
          targetGrade: selections[subjectId].targetGrade,
        })),
        removedSubjectIds,
      });
      setStatus(result.error ? "error" : "saved");
    });
  }

  return (
    <div className="space-y-4">
      {status === "saved" && (
        <div className="rounded-2xl bg-success-soft px-4 py-3 text-sm font-medium text-success">
          Subjects updated!
        </div>
      )}
      {status === "error" && (
        <div className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          We couldn&apos;t save your subjects. Please try again.
        </div>
      )}

      <div className="space-y-3">
        {selectedIds.map((subjectId) => {
          const subject = allSubjects.find((s) => s.id === subjectId);
          if (!subject) return null;
          const Icon = getSubjectIcon(subject.icon);
          const theme = getSubjectTheme(subject.color_theme);
          const selection = selections[subjectId];
          const availableBoardIds = new Set(
            subjectExamBoards.filter((seb) => seb.subject_id === subjectId).map((seb) => seb.exam_board_id),
          );
          const availableBoards = examBoards.filter((b) => availableBoardIds.has(b.id));

          return (
            <div key={subjectId} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex size-9 items-center justify-center rounded-xl", theme.soft)}>
                  <Icon className={cn("size-4.5", theme.base.split(" ")[0])} strokeWidth={2.25} />
                </div>
                <p className="flex-1 font-bold text-ink">{subject.name}</p>
                <button
                  onClick={() => removeSubject(subjectId)}
                  className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-danger-soft hover:text-danger"
                  aria-label={`Remove ${subject.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Exam board</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {availableBoards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => updateSelection(subjectId, { examBoardId: board.id })}
                    className={cn(
                      "rounded-pill border-2 px-3 py-1 text-xs font-semibold transition-colors",
                      selection.examBoardId === board.id
                        ? "border-brand bg-brand text-white"
                        : "border-border text-ink-muted hover:border-brand/40",
                    )}
                  >
                    {board.name}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Target grade</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {GCSE_GRADES.map((grade) => (
                  <button
                    key={grade}
                    onClick={() =>
                      updateSelection(subjectId, { targetGrade: selection.targetGrade === grade ? null : grade })
                    }
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                      selection.targetGrade === grade
                        ? "border-brand bg-brand text-white"
                        : "border-border text-ink-muted hover:border-brand/40",
                    )}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {remainingSubjects.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Add a subject</p>
          <div className="flex flex-wrap gap-2">
            {remainingSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => addSubject(subject.id)}
                className="flex items-center gap-1.5 rounded-pill border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-ink-muted hover:border-brand/40 hover:text-brand"
              >
                <Plus className="size-3.5" />
                {subject.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={!canSave} loading={pending} icon={<Save className="size-4" />}>
        Save subjects
      </Button>
    </div>
  );
}
