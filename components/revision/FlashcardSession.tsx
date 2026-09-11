"use client";

import { useState, useTransition } from "react";
import { ThumbsDown, Meh, ThumbsUp, RotateCw } from "lucide-react";
import { completeFlashcardSessionAction } from "@/lib/actions/revision";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SessionComplete } from "@/components/revision/SessionComplete";
import { cn } from "@/lib/utils";
import type { FlashcardConfidence } from "@/lib/types/database";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const CONFIDENCE_OPTIONS: { value: FlashcardConfidence; label: string; icon: typeof ThumbsDown; className: string }[] = [
  { value: "low", label: "Still learning", icon: ThumbsDown, className: "border-danger/30 text-danger hover:bg-danger-soft" },
  { value: "medium", label: "Getting there", icon: Meh, className: "border-warning/30 text-warning hover:bg-warning-soft" },
  { value: "high", label: "Nailed it", icon: ThumbsUp, className: "border-success/30 text-success hover:bg-success-soft" },
];

export function FlashcardSession({
  topicId,
  topicName,
  color,
  cards,
}: {
  topicId: string;
  topicName: string;
  color: string;
  cards: Flashcard[];
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviews, setReviews] = useState<{ flashcardId: string; confidence: FlashcardConfidence }[]>([]);
  const [result, setResult] = useState<Awaited<ReturnType<typeof completeFlashcardSessionAction>> | null>(null);
  const [pending, startTransition] = useTransition();
  const [startTime] = useState(() => Date.now());

  const card = cards[index];

  function handleConfidence(confidence: FlashcardConfidence) {
    if (!card) return;
    const nextReviews = [...reviews, { flashcardId: card.id, confidence }];

    if (index + 1 < cards.length) {
      setReviews(nextReviews);
      setIndex((i) => i + 1);
      setRevealed(false);
      return;
    }

    startTransition(async () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      const res = await completeFlashcardSessionAction(topicId, nextReviews, durationSeconds);
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
        backHref="/revision"
      />
    );
  }

  if (!card) return null;

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center justify-between text-sm font-semibold text-ink-muted">
        <span>{topicName}</span>
        <span>
          {index + 1} / {cards.length}
        </span>
      </div>
      <ProgressBar value={index + (revealed ? 0.5 : 0)} max={cards.length} className="mt-2" barClassName="bg-brand" />

      <div className="mt-8 [perspective:1200px]">
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="relative h-72 w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-border bg-surface p-8 text-center shadow-[0_20px_45px_-20px_rgba(30,27,58,0.25)] [backface-visibility:hidden]"
            style={{ borderColor: color }}
          >
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Question</span>
            <p className="text-lg font-bold text-ink">{card.question}</p>
            <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
              <RotateCw className="size-3.5" />
              Tap to reveal
            </span>
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-border bg-surface p-8 text-center shadow-[0_20px_45px_-20px_rgba(30,27,58,0.25)] [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)", borderColor: color }}
          >
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Answer</span>
            <p className="text-lg font-bold text-ink">{card.answer}</p>
          </div>
        </button>
      </div>

      {revealed ? (
        <div className="mt-8 grid grid-cols-3 gap-2.5">
          {CONFIDENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={pending}
              onClick={() => handleConfidence(option.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border-2 bg-surface py-3.5 text-xs font-bold transition-colors disabled:opacity-50",
                option.className,
              )}
            >
              <option.icon className="size-5" />
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <Button fullWidth size="lg" className="mt-8" onClick={() => setRevealed(true)}>
          Reveal answer
        </Button>
      )}
    </div>
  );
}
