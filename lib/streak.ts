import { daysBetween, todayIso } from "@/lib/utils";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export interface StreakUpdateResult extends StreakState {
  streakChanged: boolean;
  streakExtended: boolean;
}

/**
 * Pure streak calculation. A streak only extends when a *qualifying*
 * revision activity (a completed flashcard/quiz/practice session) happens
 * on a new calendar day — logging in alone never counts, and the caller is
 * responsible for only invoking this once a session has actually completed.
 */
export function computeStreakUpdate(state: StreakState): StreakUpdateResult {
  const today = todayIso();

  if (state.lastActivityDate === today) {
    // Already logged a qualifying activity today — no change.
    return { ...state, streakChanged: false, streakExtended: false };
  }

  const gap = state.lastActivityDate ? daysBetween(state.lastActivityDate, today) : null;
  const isConsecutive = gap === 1;

  const currentStreak = isConsecutive ? state.currentStreak + 1 : 1;
  const longestStreak = Math.max(state.longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: today,
    streakChanged: true,
    streakExtended: true,
  };
}
