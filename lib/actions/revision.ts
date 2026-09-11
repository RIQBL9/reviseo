"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateFlashcardSessionXp, calculateQuizSessionXp } from "@/lib/xp";
import { computeStreakUpdate } from "@/lib/streak";
import { calculateMasteryScore, masteryLevelFromScore } from "@/lib/mastery";
import type { FlashcardConfidence } from "@/lib/types/database";

interface RevisionResult {
  xpEarned: number;
  totalXp: number;
  streakExtended: boolean;
  currentStreak: number;
  masteryScore: number;
}

async function countSessionsTodayForTopic(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  topicId: string,
  activityType: "flashcards" | "quiz",
) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("revision_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .eq("activity_type", activityType)
    .gte("started_at", startOfDay.toISOString());

  return count ?? 0;
}

async function applyXpAndStreak(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  xpEarned: number,
): Promise<{ totalXp: number; currentStreak: number; streakExtended: boolean }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp, current_streak, longest_streak, last_activity_date")
    .eq("id", userId)
    .single();

  const baseXp = profile?.total_xp ?? 0;
  const streakUpdate = computeStreakUpdate({
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    lastActivityDate: profile?.last_activity_date ?? null,
  });

  await supabase
    .from("profiles")
    .update({
      total_xp: baseXp + xpEarned,
      current_streak: streakUpdate.currentStreak,
      longest_streak: streakUpdate.longestStreak,
      last_activity_date: streakUpdate.lastActivityDate,
    })
    .eq("id", userId);

  return {
    totalXp: baseXp + xpEarned,
    currentStreak: streakUpdate.currentStreak,
    streakExtended: streakUpdate.streakExtended,
  };
}

async function upsertTopicProgress(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  topicId: string,
  delta: { questionsAnswered?: number; questionsCorrect?: number; flashcardsReviewed?: number },
): Promise<number> {
  const { data: existing } = await supabase
    .from("user_topic_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .maybeSingle();

  const questionsAnswered = (existing?.questions_answered ?? 0) + (delta.questionsAnswered ?? 0);
  const questionsCorrect = (existing?.questions_correct ?? 0) + (delta.questionsCorrect ?? 0);
  const flashcardsReviewed = (existing?.flashcards_reviewed ?? 0) + (delta.flashcardsReviewed ?? 0);
  const lastRevisedAt = new Date().toISOString();

  const masteryScore = calculateMasteryScore({
    questionsAnswered,
    questionsCorrect,
    flashcardsReviewed,
    lastRevisedAt,
  });
  const masteryLevel = masteryLevelFromScore(masteryScore, questionsAnswered + flashcardsReviewed > 0);

  await supabase.from("user_topic_progress").upsert(
    {
      user_id: userId,
      topic_id: topicId,
      questions_answered: questionsAnswered,
      questions_correct: questionsCorrect,
      flashcards_reviewed: flashcardsReviewed,
      last_revised_at: lastRevisedAt,
      mastery_score: masteryScore,
      mastery_level: masteryLevel,
    },
    { onConflict: "user_id,topic_id" },
  );

  return masteryScore;
}

export async function completeFlashcardSessionAction(
  topicId: string,
  reviews: { flashcardId: string; confidence: FlashcardConfidence }[],
  durationSeconds: number,
): Promise<RevisionResult | { error: string }> {
  if (reviews.length === 0) return { error: "No cards were reviewed." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const sessionsToday = await countSessionsTodayForTopic(supabase, user.id, topicId, "flashcards");
  const confidentCount = reviews.filter((r) => r.confidence !== "low").length;
  const xpEarned = calculateFlashcardSessionXp(reviews.length, sessionsToday);

  const { data: session } = await supabase
    .from("revision_sessions")
    .insert({
      user_id: user.id,
      topic_id: topicId,
      activity_type: "flashcards",
      items_total: reviews.length,
      items_correct: confidentCount,
      duration_seconds: durationSeconds,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (session) {
    await supabase.from("flashcard_reviews").insert(
      reviews.map((r) => ({
        user_id: user.id,
        flashcard_id: r.flashcardId,
        confidence: r.confidence,
        revision_session_id: session.id,
      })),
    );
  }

  if (xpEarned > 0) {
    await supabase.from("xp_events").insert({
      user_id: user.id,
      amount: xpEarned,
      reason: "flashcards_session",
      revision_session_id: session?.id ?? null,
    });
  }

  const masteryScore = await upsertTopicProgress(supabase, user.id, topicId, {
    flashcardsReviewed: reviews.length,
  });
  const { totalXp, currentStreak, streakExtended } = await applyXpAndStreak(supabase, user.id, xpEarned);

  return { xpEarned, totalXp, streakExtended, currentStreak, masteryScore };
}

export async function completeQuizSessionAction(
  topicId: string,
  answers: { questionId: string; userAnswer: string; isCorrect: boolean }[],
  durationSeconds: number,
): Promise<(RevisionResult & { correctCount: number }) | { error: string }> {
  if (answers.length === 0) return { error: "No questions were answered." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const sessionsToday = await countSessionsTodayForTopic(supabase, user.id, topicId, "quiz");
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const xpEarned = calculateQuizSessionXp(correctCount, answers.length, sessionsToday);

  const { data: session } = await supabase
    .from("revision_sessions")
    .insert({
      user_id: user.id,
      topic_id: topicId,
      activity_type: "quiz",
      items_total: answers.length,
      items_correct: correctCount,
      duration_seconds: durationSeconds,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (session) {
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        topic_id: topicId,
        revision_session_id: session.id,
        score: correctCount,
        total_questions: answers.length,
      })
      .select("id")
      .single();

    if (attempt) {
      await supabase.from("quiz_answers").insert(
        answers.map((a) => ({
          quiz_attempt_id: attempt.id,
          question_id: a.questionId,
          user_answer: a.userAnswer,
          is_correct: a.isCorrect,
        })),
      );
    }
  }

  if (xpEarned > 0) {
    await supabase.from("xp_events").insert({
      user_id: user.id,
      amount: xpEarned,
      reason: "quiz_completed",
      revision_session_id: session?.id ?? null,
    });
  }

  const masteryScore = await upsertTopicProgress(supabase, user.id, topicId, {
    questionsAnswered: answers.length,
    questionsCorrect: correctCount,
  });
  const { totalXp, currentStreak, streakExtended } = await applyXpAndStreak(supabase, user.id, xpEarned);

  return { xpEarned, totalXp, streakExtended, currentStreak, masteryScore, correctCount };
}
