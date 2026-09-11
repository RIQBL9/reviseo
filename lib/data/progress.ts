import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/types/database";
import { getLeafTopics, progressFromRow, averageMastery } from "@/lib/data/topics";
import type { DashboardSubjectSummary } from "@/lib/data/dashboard";

export interface WeeklyPoint {
  date: string;
  label: string;
  xp: number;
}

export interface ProgressData {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  overallMasteryPct: number;
  subjects: DashboardSubjectSummary[];
  topicsCompleted: number;
  topicsTotal: number;
  revisionMinutes: number;
  questionsAnswered: number;
  questionsCorrect: number;
  accuracyPct: number;
  weeklyXp: WeeklyPoint[];
}

const EMPTY: Omit<ProgressData, "totalXp" | "currentStreak" | "longestStreak" | "weeklyXp"> = {
  overallMasteryPct: 0,
  subjects: [],
  topicsCompleted: 0,
  topicsTotal: 0,
  revisionMinutes: 0,
  questionsAnswered: 0,
  questionsCorrect: 0,
  accuracyPct: 0,
};

function buildWeeklyBuckets(xpEvents: { amount: number; created_at: string }[]): WeeklyPoint[] {
  const days: WeeklyPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-GB", { weekday: "short" });
    days.push({ date, label, xp: 0 });
  }
  const byDate = new Map(days.map((d) => [d.date, d]));
  for (const event of xpEvents) {
    const date = event.created_at.slice(0, 10);
    const bucket = byDate.get(date);
    if (bucket) bucket.xp += event.amount;
  }
  return days;
}

export async function getProgressData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProgressData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [{ data: profile }, { data: userSubjects }, { data: xpEvents }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("total_xp, current_streak, longest_streak").eq("id", userId).single(),
    supabase.from("user_subjects").select("*").eq("user_id", userId),
    supabase
      .from("xp_events")
      .select("amount, created_at")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("revision_sessions").select("duration_seconds").eq("user_id", userId),
  ]);

  const totalXp = profile?.total_xp ?? 0;
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const weeklyXp = buildWeeklyBuckets(xpEvents ?? []);
  const revisionMinutes = Math.round((sessions ?? []).reduce((sum, s) => sum + s.duration_seconds, 0) / 60);

  if (!userSubjects || userSubjects.length === 0) {
    return { ...EMPTY, totalXp, currentStreak, longestStreak, revisionMinutes, weeklyXp };
  }

  const subjectIds = userSubjects.map((us) => us.subject_id);
  const examBoardIds = userSubjects.map((us) => us.exam_board_id);

  const [{ data: subjects }, { data: examBoards }, { data: specs }] = await Promise.all([
    supabase.from("subjects").select("*").in("id", subjectIds),
    supabase.from("exam_boards").select("*").in("id", examBoardIds),
    supabase.from("subject_exam_boards").select("*").in("subject_id", subjectIds),
  ]);

  const subjectById = new Map((subjects ?? []).map((s) => [s.id, s]));
  const examBoardById = new Map((examBoards ?? []).map((b) => [b.id, b]));

  const specByUserSubject = new Map<string, Tables<"subject_exam_boards">>();
  for (const us of userSubjects) {
    const match = (specs ?? []).find((s) => s.subject_id === us.subject_id && s.exam_board_id === us.exam_board_id);
    if (match) specByUserSubject.set(us.id, match);
  }

  const specIds = [...specByUserSubject.values()].map((s) => s.id);
  const { data: allTopics } = specIds.length
    ? await supabase.from("topics").select("*").in("subject_exam_board_id", specIds)
    : { data: [] as Tables<"topics">[] };

  const topicsBySpec = new Map<string, Tables<"topics">[]>();
  for (const topic of allTopics ?? []) {
    const list = topicsBySpec.get(topic.subject_exam_board_id) ?? [];
    list.push(topic);
    topicsBySpec.set(topic.subject_exam_board_id, list);
  }

  const allLeafIds = [...topicsBySpec.values()].flatMap((topics) => getLeafTopics(topics).map((t) => t.id));
  const { data: progressRows } = allLeafIds.length
    ? await supabase.from("user_topic_progress").select("*").eq("user_id", userId).in("topic_id", allLeafIds)
    : { data: [] as Tables<"user_topic_progress">[] };
  const progressByTopic = new Map((progressRows ?? []).map((p) => [p.topic_id, p]));

  const subjectSummaries: DashboardSubjectSummary[] = [];
  let topicsCompleted = 0;
  let topicsTotal = 0;
  let questionsAnswered = 0;
  let questionsCorrect = 0;

  for (const us of userSubjects) {
    const subject = subjectById.get(us.subject_id);
    const examBoard = examBoardById.get(us.exam_board_id);
    const spec = specByUserSubject.get(us.id);
    if (!subject || !examBoard) continue;

    const leaves = spec ? getLeafTopics(topicsBySpec.get(spec.id) ?? []) : [];
    const scores = leaves.map((t) => progressFromRow(progressByTopic.get(t.id)).masteryScore);
    const started = leaves.filter((t) => progressByTopic.has(t.id));

    topicsTotal += leaves.length;
    topicsCompleted += started.filter((t) => progressByTopic.get(t.id)?.mastery_level !== "not_started").length;

    for (const t of leaves) {
      const p = progressByTopic.get(t.id);
      if (p) {
        questionsAnswered += p.questions_answered;
        questionsCorrect += p.questions_correct;
      }
    }

    subjectSummaries.push({
      subject,
      examBoard,
      targetGrade: us.target_grade,
      masteryPct: averageMastery(scores),
      completionPct: leaves.length ? Math.round((started.length / leaves.length) * 100) : 0,
      topicCount: leaves.length,
    });
  }

  return {
    totalXp,
    currentStreak,
    longestStreak,
    overallMasteryPct: averageMastery(subjectSummaries.map((s) => s.masteryPct)),
    subjects: subjectSummaries,
    topicsCompleted,
    topicsTotal,
    revisionMinutes,
    questionsAnswered,
    questionsCorrect,
    accuracyPct: questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0,
    weeklyXp,
  };
}
