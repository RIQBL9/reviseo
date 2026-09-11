import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/types/database";
import {
  buildTopicTree,
  progressFromRow,
  averageMastery,
  masteryLevelFromScore,
  type TopicNode,
  type TopicProgress,
} from "@/lib/data/topics";

export interface TopicNodeWithProgress extends Omit<Tables<"topics">, never> {
  children: TopicNodeWithProgress[];
  progress: TopicProgress;
  isLeaf: boolean;
}

function enrich(
  node: TopicNode,
  progressByTopic: Map<string, Tables<"user_topic_progress">>,
): TopicNodeWithProgress {
  const children = node.children.map((child) => enrich(child, progressByTopic));
  const isLeaf = children.length === 0;

  let progress: TopicProgress;
  if (isLeaf) {
    progress = progressFromRow(progressByTopic.get(node.id));
  } else {
    const scores = children.map((c) => c.progress.masteryScore);
    const anyActivity = children.some((c) => c.progress.questionsAnswered > 0 || c.progress.flashcardsReviewed > 0);
    const masteryScore = averageMastery(scores);
    const lastRevisedAt = children.reduce<string | null>((latest, c) => {
      if (!c.progress.lastRevisedAt) return latest;
      if (!latest || new Date(c.progress.lastRevisedAt) > new Date(latest)) return c.progress.lastRevisedAt;
      return latest;
    }, null);

    progress = {
      masteryScore,
      masteryLevel: masteryLevelFromScore(masteryScore, anyActivity),
      questionsAnswered: children.reduce((sum, c) => sum + c.progress.questionsAnswered, 0),
      questionsCorrect: children.reduce((sum, c) => sum + c.progress.questionsCorrect, 0),
      flashcardsReviewed: children.reduce((sum, c) => sum + c.progress.flashcardsReviewed, 0),
      lastRevisedAt,
    };
  }

  return { ...node, children, progress, isLeaf };
}

export interface SubjectDetail {
  subject: Tables<"subjects">;
  examBoard: Tables<"exam_boards">;
  targetGrade: number | null;
  overallMasteryPct: number;
  topics: TopicNodeWithProgress[];
}

export async function getSubjectDetail(
  supabase: SupabaseClient<Database>,
  userId: string,
  subjectSlug: string,
): Promise<SubjectDetail | null> {
  const { data: subject } = await supabase.from("subjects").select("*").eq("slug", subjectSlug).single();
  if (!subject) return null;

  const { data: userSubject } = await supabase
    .from("user_subjects")
    .select("*")
    .eq("user_id", userId)
    .eq("subject_id", subject.id)
    .maybeSingle();
  if (!userSubject) return null;

  const { data: examBoard } = await supabase
    .from("exam_boards")
    .select("*")
    .eq("id", userSubject.exam_board_id)
    .single();
  if (!examBoard) return null;

  const { data: spec } = await supabase
    .from("subject_exam_boards")
    .select("*")
    .eq("subject_id", subject.id)
    .eq("exam_board_id", examBoard.id)
    .maybeSingle();

  const { data: rawTopics } = spec
    ? await supabase.from("topics").select("*").eq("subject_exam_board_id", spec.id).order("sort_order")
    : { data: [] as Tables<"topics">[] };

  const topicIds = (rawTopics ?? []).map((t) => t.id);
  const { data: progressRows } = topicIds.length
    ? await supabase.from("user_topic_progress").select("*").eq("user_id", userId).in("topic_id", topicIds)
    : { data: [] as Tables<"user_topic_progress">[] };

  const progressByTopic = new Map((progressRows ?? []).map((p) => [p.topic_id, p]));
  const tree = buildTopicTree(rawTopics ?? []).map((node) => enrich(node, progressByTopic));

  const overallMasteryPct = averageMastery(tree.map((t) => t.progress.masteryScore));

  return {
    subject,
    examBoard,
    targetGrade: userSubject.target_grade,
    overallMasteryPct,
    topics: tree,
  };
}
