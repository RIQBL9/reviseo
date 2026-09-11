export const XP_RULES = {
  FLASHCARD_REVIEWED: 2,
  QUIZ_CORRECT_ANSWER: 5,
  QUIZ_COMPLETION_BONUS: 10,
  DAILY_GOAL_BONUS: 20,
} as const;

/** Hard ceiling so a single session can never award an absurd amount of XP. */
const MAX_SESSION_XP = 150;

/**
 * Same-day repeats of the same topic + activity are worth less XP each time.
 * This keeps flashcards/quizzes genuinely re-doable for revision without
 * letting a student farm XP by rapidly repeating the same short activity.
 */
export function repeatMultiplier(sessionsTodayForTopic: number) {
  if (sessionsTodayForTopic <= 0) return 1;
  if (sessionsTodayForTopic === 1) return 0.5;
  return 0.2;
}

export function calculateFlashcardSessionXp(cardsReviewed: number, sessionsTodayForTopic: number) {
  const base = Math.min(cardsReviewed, 30) * XP_RULES.FLASHCARD_REVIEWED;
  const xp = Math.round(base * repeatMultiplier(sessionsTodayForTopic));
  return Math.min(xp, MAX_SESSION_XP);
}

export function calculateQuizSessionXp(
  correctAnswers: number,
  totalQuestions: number,
  sessionsTodayForTopic: number,
) {
  const base =
    correctAnswers * XP_RULES.QUIZ_CORRECT_ANSWER +
    (totalQuestions > 0 ? XP_RULES.QUIZ_COMPLETION_BONUS : 0);
  const xp = Math.round(base * repeatMultiplier(sessionsTodayForTopic));
  return Math.min(xp, MAX_SESSION_XP);
}
