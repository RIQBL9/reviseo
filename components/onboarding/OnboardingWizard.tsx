"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";
import type { Tables, YearGroup } from "@/lib/types/database";
import { completeOnboardingAction } from "@/app/onboarding/actions";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { WelcomeStep } from "@/components/onboarding/steps/WelcomeStep";
import { YearGroupStep } from "@/components/onboarding/steps/YearGroupStep";
import { SubjectsStep } from "@/components/onboarding/steps/SubjectsStep";
import { ExamBoardsStep } from "@/components/onboarding/steps/ExamBoardsStep";
import { GradesStep } from "@/components/onboarding/steps/GradesStep";
import { FinishStep } from "@/components/onboarding/steps/FinishStep";
import { Button } from "@/components/ui/Button";

const STEP_LABELS = ["Welcome", "Year group", "Subjects", "Exam boards", "Target grades", "Finish"];

interface OnboardingWizardProps {
  displayName: string;
  subjects: Tables<"subjects">[];
  examBoards: Tables<"exam_boards">[];
  subjectExamBoards: Tables<"subject_exam_boards">[];
}

export function OnboardingWizard({
  displayName,
  subjects,
  examBoards,
  subjectExamBoards,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [yearGroup, setYearGroup] = useState<YearGroup | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
  const [boardSelection, setBoardSelection] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Record<string, number | null>>({});
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const selectedSubjects = useMemo(
    () => subjects.filter((s) => selectedSubjectIds.has(s.id)),
    [subjects, selectedSubjectIds],
  );

  function toggleSubject(subjectId: string) {
    setSelectedSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  }

  function canAdvance() {
    if (step === 1) return yearGroup !== null;
    if (step === 2) return selectedSubjectIds.size > 0;
    if (step === 3) return selectedSubjects.every((s) => boardSelection[s.id]);
    return true;
  }

  function handleFinish() {
    if (!yearGroup) return;
    setError(undefined);
    startTransition(async () => {
      const result = await completeOnboardingAction({
        yearGroup,
        subjects: selectedSubjects.map((s) => ({
          subjectId: s.id,
          examBoardId: boardSelection[s.id],
          targetGrade: grades[s.id] ?? null,
        })),
      });
      if (result?.error) setError(result.error);
    });
  }

  const showChrome = step > 0;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-8 sm:px-6">
      {showChrome && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="flex size-9 items-center justify-center rounded-full border border-border text-ink-muted hover:bg-surface-muted"
            aria-label="Go back"
          >
            <ChevronLeft className="size-4.5" />
          </button>
          <StepIndicator step={step - 1} totalSteps={STEP_LABELS.length - 1} labels={STEP_LABELS.slice(1)} />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center py-8">
        {step === 0 && <WelcomeStep displayName={displayName} onNext={() => setStep(1)} />}
        {step === 1 && <YearGroupStep value={yearGroup} onChange={setYearGroup} />}
        {step === 2 && (
          <SubjectsStep subjects={subjects} selected={selectedSubjectIds} onToggle={toggleSubject} />
        )}
        {step === 3 && (
          <ExamBoardsStep
            selectedSubjects={selectedSubjects}
            examBoards={examBoards}
            subjectExamBoards={subjectExamBoards}
            selection={boardSelection}
            onChange={(subjectId, examBoardId) =>
              setBoardSelection((prev) => ({ ...prev, [subjectId]: examBoardId }))
            }
          />
        )}
        {step === 4 && (
          <GradesStep
            selectedSubjects={selectedSubjects}
            grades={grades}
            onChange={(subjectId, grade) => setGrades((prev) => ({ ...prev, [subjectId]: grade }))}
          />
        )}
        {step === 5 && (
          <FinishStep
            selectedSubjects={selectedSubjects}
            examBoards={examBoards}
            boardSelection={boardSelection}
            grades={grades}
            onFinish={handleFinish}
            pending={pending}
            error={error}
          />
        )}
      </div>

      {step > 0 && step < 5 && (
        <Button fullWidth size="lg" disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
          Continue
        </Button>
      )}
    </div>
  );
}
