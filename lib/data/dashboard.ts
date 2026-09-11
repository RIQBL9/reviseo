import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/types/database";
import { getLeafTopics, progressFromRow, averageMastery } from "@/lib/data/topics";

export interface DashboardSubjectSummary {
  subject: Tables<"subjects">;
  examBoard: Tables<"exam_boards">;
  targetGrade: number | null;
  masteryPct: number;
  completionPct: number;
  topicCount: number;
}

export interface DashboardTopicHighlight {
  subject: Tables<"subjects">;
  topic: Tables<"topics">;
  masteryScore: number;
}

export interface DashboardData {
  todayXp: number;
  subjects: DashboardSubjectSummary[];
  continueRevising: DashboardTopicHighlight | null;
  recommended: DashboardTopicHighlight | null;
}

const EMPTY: DashboardData = { todayXp: 0, subjects: [], continueRevising: null, recommended: null };

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DashboardData> {
  const { data: userSubjects } = await supabase.from("user_subjects").select("*").eq("user_id", userId);

  if (!userSubjects || userSubjects.length === 0) return EMPTY;

  const subjectIds = userSubjects.map((us) => us.subject_id);
  const examBoardIds = userSubjects.map((us) => us.exam_board_id);

  const [{ data: subjects }, { data: examBoards }, { data: specs }, { data: todayXpEvents }] = await Promise.all([
    supabase.from("subjects").select("*").in("id", subjectIds),
    supabase.from("exam_boards").select("*").in("id", examBoardIds),
    supabase.from("subject_exam_boards").select("*").in("subject_id", subjectIds),
    supabase
      .from("xp_events")
      .select("amount")
      .eq("user_id", userId)
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const subjectById = new Map((subjects ?? []).map((s) => [s.id, s]));
  const examBoardById = new Map((examBoards ?? []).map((b) => [b.id, b]));
  const todayXp = (todayXpEvents ?? []).reduce((sum, e) => sum + e.amount, 0);

  // Resolve each user_subject to its specification (subject_exam_boards row).
  const specByUserSubject = new Map<string, Tables<"subject_exam_boards">>();
  for (const us of userSubjects) {
    const match = (specs ?? []).find(
      (spec) => spec.subject_id === us.subject_id && spec.exam_board_id === us.exam_board_id,
    );
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

  const allLeafTopicIds = [...topicsBySpec.values()].flatMap((topics) => getLeafTopics(topics).map((t) => t.id));

  const { data: progressRows } = allLeafTopicIds.length
    ? await supabase
        .from("user_topic_progress")
        .select("*")
        .eq("user_id", userId)
        .in("topic_id", allLeafTopicIds)
    : { data: [] as Tables<"user_topic_progress">[] };

  const progressByTopic = new Map((progressRows ?? []).map((p) => [p.topic_id, p]));

  const subjectSummaries: DashboardSubjectSummary[] = [];
  const highlights: DashboardTopicHighlight[] = [];

  for (const us of userSubjects) {
    const subject = subjectById.get(us.subject_id);
    const examBoard = examBoardById.get(us.exam_board_id);
    const spec = specByUserSubject.get(us.id);
    if (!subject || !examBoard) continue;

    const topics = spec ? (topicsBySpec.get(spec.id) ?? []) : [];
    const leaves = getLeafTopics(topics);
    const scores = leaves.map((t) => progressFromRow(progressByTopic.get(t.id)).masteryScore);
    const started = leaves.filter((t) => progressByTopic.has(t.id));

    subjectSummaries.push({
      subject,
      examBoard,
      targetGrade: us.target_grade,
      masteryPct: averageMastery(scores),
      completionPct: leaves.length ? Math.round((started.length / leaves.length) * 100) : 0,
      topicCount: leaves.length,
    });

    for (const topic of leaves) {
      const progress = progressFromRow(progressByTopic.get(topic.id));
      if (progressByTopic.has(topic.id)) {
        highlights.push({ subject, topic, masteryScore: progress.masteryScore });
      }
    }
  }

  // "Continue revising": most recently touched topic that isn't mastered yet.
  const inProgress = [...progressByTopic.values()]
    .filter((p) => p.mastery_level === "learning" || p.mastery_level === "improving")
    .sort((a, b) => new Date(b.last_revised_at ?? 0).getTime() - new Date(a.last_revised_at ?? 0).getTime());

  let continueRevising: DashboardTopicHighlight | null = null;
  if (inProgress[0]) {
    const match = highlights.find((h) => h.topic.id === inProgress[0].topic_id);
    if (match) continueRevising = match;
  }
  if (!continueRevising) {
    // Fall back to the first not-yet-started topic in the student's first subject.
    for (const us of userSubjects) {
      const spec = specByUserSubject.get(us.id);
      const subject = subjectById.get(us.subject_id);
      if (!spec || !subject) continue;
      const leaves = getLeafTopics(topicsBySpec.get(spec.id) ?? []);
      const notStarted = leaves.find((t) => !progressByTopic.has(t.id));
      if (notStarted) {
        continueRevising = { subject, topic: notStarted, masteryScore: 0 };
        break;
      }
    }
  }

  // "Recommended": weakest topic the student has actually attempted, excluding the one above.
  const recommended =
    highlights
      .filter((h) => h.topic.id !== continueRevising?.topic.id && h.masteryScore < 60)
      .sort((a, b) => a.masteryScore - b.masteryScore)[0] ?? null;

  return {
    todayXp,
    subjects: subjectSummaries,
    continueRevising,
    recommended,
  };
}
