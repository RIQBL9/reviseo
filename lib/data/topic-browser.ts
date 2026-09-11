import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/types/database";
import { getLeafTopics, progressFromRow } from "@/lib/data/topics";

export interface BrowsableTopic {
  id: string;
  name: string;
  masteryScore: number;
  masteryLevel: Tables<"user_topic_progress">["mastery_level"];
}

export interface SubjectTopicGroup {
  subject: Tables<"subjects">;
  examBoard: Tables<"exam_boards">;
  topics: BrowsableTopic[];
}

export async function getUserTopicGroups(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SubjectTopicGroup[]> {
  const { data: userSubjects } = await supabase.from("user_subjects").select("*").eq("user_id", userId);
  if (!userSubjects || userSubjects.length === 0) return [];

  const subjectIds = userSubjects.map((us) => us.subject_id);
  const examBoardIds = userSubjects.map((us) => us.exam_board_id);

  const [{ data: subjects }, { data: examBoards }, { data: specs }] = await Promise.all([
    supabase.from("subjects").select("*").in("id", subjectIds).order("sort_order"),
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
    ? await supabase.from("topics").select("*").in("subject_exam_board_id", specIds).order("sort_order")
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

  const groups: SubjectTopicGroup[] = [];
  for (const us of userSubjects) {
    const subject = subjectById.get(us.subject_id);
    const examBoard = examBoardById.get(us.exam_board_id);
    const spec = specByUserSubject.get(us.id);
    if (!subject || !examBoard) continue;

    const leaves = spec ? getLeafTopics(topicsBySpec.get(spec.id) ?? []) : [];
    groups.push({
      subject,
      examBoard,
      topics: leaves.map((t) => {
        const progress = progressFromRow(progressByTopic.get(t.id));
        return { id: t.id, name: t.name, masteryScore: progress.masteryScore, masteryLevel: progress.masteryLevel };
      }),
    });
  }

  return groups;
}
