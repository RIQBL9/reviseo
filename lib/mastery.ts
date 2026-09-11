import type { MasteryLevel } from "@/lib/types/database";

export interface TopicProgressInput {
  questionsAnswered: number;
  questionsCorrect: number;
  flashcardsReviewed: number;
  lastRevisedAt: string | null;
}

const RECENCY_FULL_CREDIT_DAYS = 7;
const RECENCY_ZERO_CREDIT_DAYS = 30;

/**
 * Mastery blends three signals so a student can't inflate it with one alone:
 *  - accuracy (60%): how often they get questions right
 *  - volume (25%): how much they've actually practised (caps out at 40 items)
 *  - recency (15%): decays if they haven't revisited the topic recently
 */
export function calculateMasteryScore(input: TopicProgressInput): number {
  const accuracy =
    input.questionsAnswered > 0 ? input.questionsCorrect / input.questionsAnswered : 0;

  const totalActivity = input.questionsAnswered + input.flashcardsReviewed;
  const volume = Math.min(totalActivity / 40, 1);

  let recency = 0;
  if (input.lastRevisedAt) {
    const daysSince = Math.floor(
      (Date.now() - new Date(input.lastRevisedAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSince <= RECENCY_FULL_CREDIT_DAYS) {
      recency = 1;
    } else if (daysSince >= RECENCY_ZERO_CREDIT_DAYS) {
      recency = 0;
    } else {
      recency =
        1 -
        (daysSince - RECENCY_FULL_CREDIT_DAYS) /
          (RECENCY_ZERO_CREDIT_DAYS - RECENCY_FULL_CREDIT_DAYS);
    }
  }

  const score = accuracy * 0.6 + volume * 0.25 + recency * 0.15;
  return Math.round(score * 100);
}

export function masteryLevelFromScore(score: number, hasAnyActivity: boolean): MasteryLevel {
  if (!hasAnyActivity || score === 0) return "not_started";
  if (score < 30) return "learning";
  if (score < 60) return "improving";
  if (score < 85) return "confident";
  return "mastered";
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  not_started: "Not started",
  learning: "Learning",
  improving: "Improving",
  confident: "Confident",
  mastered: "Mastered",
};

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  not_started: "text-slate-400",
  learning: "text-rose-500",
  improving: "text-amber-500",
  confident: "text-blue-500",
  mastered: "text-emerald-500",
};
