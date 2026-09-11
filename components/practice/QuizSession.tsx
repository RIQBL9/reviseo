"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { completeQuizSessionAction } from "@/lib/actions/revision";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SessionComplete } from "@/components/revision/SessionComplete";
import { cn } from "@/lib/utils";
import type { QuestionOption, QuestionType } from "@/lib/types/database";

interface Question {
  id: string;
  questionType: QuestionType;
  prompt: string;
  options: QuestionOption[] | null;
  correctAnswer: string;
  explanation: string | null;
}

interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export function QuizSession({
  topicId,
  topicName,
  questions,
}: {
  topicId: string;
  topicName: string;
  questions: Question[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [result, setResult] = useState<Awaited<ReturnType<typeof completeQuizSessionAction>> | null>(null);
  const [pending, startTransition] = useTransition();
  const [startTime] = useState(() => Date.now());

  const question = questions[index];

  function checkAnswer() {
    if (!selected.trim()) return;
    setChecked(true);
  }

  function handleNext() {
    if (!question) return;
    const isCorrect = selected.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    const nextAnswers = [...answers, { questionId: question.id, userAnswer: selected, isCorrect }];

    if (index + 1 < questions.length) {
      setAnswers(nextAnswers);
      setIndex((i) => i + 1);
      setSelected("");
      setChecked(false);
      return;
    }

    startTransition(async () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      const res = await completeQuizSessionAction(topicId, nextAnswers, durationSeconds);
      setResult(res);
    });
  }

  if (result) {
    if ("error" in result) {
      return <p className="text-center text-danger">{result.error}</p>;
    }
    return (
      <SessionComplete
        topicName={topicName}
        xpEarned={result.xpEarned}
        streakExtended={result.streakExtended}
        currentStreak={result.currentStreak}
        masteryScore={result.masteryScore}
        scoreLabel={`${result.correctCount} / ${questions.length} correct`}
        backHref="/practice"
      />
    );
  }

  if (!question) return null;

  const isCorrect = checked && selected.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center justify-between text-sm font-semibold text-ink-muted">
        <span>{topicName}</span>
        <span>
          {index + 1} / {questions.length}
        </span>
      </div>
      <ProgressBar value={index} max={questions.length} className="mt-2" barClassName="bg-brand" />

      <div className="mt-8 rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_20px_45px_-20px_rgba(30,27,58,0.25)]">
        <p className="text-lg font-bold text-ink">{question.prompt}</p>

        {question.questionType === "multiple_choice" && question.options ? (
          <div className="mt-5 space-y-2.5">
            {question.options.map((option) => {
              const isSelectedOption = selected === option.id;
              const isCorrectOption = option.id === question.correctAnswer;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelected(option.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors disabled:cursor-default",
                    !checked && isSelectedOption && "border-brand bg-brand/5",
                    !checked && !isSelectedOption && "border-border hover:border-brand/30",
                    checked && isCorrectOption && "border-success bg-success-soft text-success",
                    checked && isSelectedOption && !isCorrectOption && "border-danger bg-danger-soft text-danger",
                    checked && !isSelectedOption && !isCorrectOption && "border-border opacity-60",
                  )}
                >
                  {option.text}
                  {checked && isCorrectOption && <Check className="size-4.5" />}
                  {checked && isSelectedOption && !isCorrectOption && <X className="size-4.5" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <Input
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              disabled={checked}
              placeholder="Type your answer"
            />
            {checked && !isCorrect && (
              <p className="mt-2 text-sm font-semibold text-success">Correct answer: {question.correctAnswer}</p>
            )}
          </div>
        )}

        {checked && question.explanation && (
          <div className={cn("mt-4 rounded-2xl px-4 py-3 text-sm", isCorrect ? "bg-success-soft text-success" : "bg-info-soft text-info")}>
            {question.explanation}
          </div>
        )}
      </div>

      {checked ? (
        <Button fullWidth size="lg" className="mt-6" loading={pending} onClick={handleNext}>
          {index + 1 < questions.length ? "Next question" : "See results"}
        </Button>
      ) : (
        <Button fullWidth size="lg" className="mt-6" disabled={!selected.trim()} onClick={checkAnswer}>
          Check answer
        </Button>
      )}
    </div>
  );
}
