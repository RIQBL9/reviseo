import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/types/database";

export interface TopicContext {
  topic: Tables<"topics">;
  subject: Tables<"subjects">;
  examBoard: Tables<"exam_boards">;
}

/** Loads a topic along with its subject/exam board, but only if the given user has actually selected that subject + exam board — prevents revising content outside a student's chosen specification. */
export async function getTopicWithContext(
  supabase: SupabaseClient<Database>,
  userId: string,
  topicId: string,
): Promise<TopicContext | null> {
  const { data: topic } = await supabase.from("topics").select("*").eq("id", topicId).single();
  if (!topic) return null;

  const { data: spec } = await supabase
    .from("subject_exam_boards")
    .select("*")
    .eq("id", topic.subject_exam_board_id)
    .single();
  if (!spec) return null;

  const { data: userSubject } = await supabase
    .from("user_subjects")
    .select("*")
    .eq("user_id", userId)
    .eq("subject_id", spec.subject_id)
    .eq("exam_board_id", spec.exam_board_id)
    .maybeSingle();
  if (!userSubject) return null;

  const [{ data: subject }, { data: examBoard }] = await Promise.all([
    supabase.from("subjects").select("*").eq("id", spec.subject_id).single(),
    supabase.from("exam_boards").select("*").eq("id", spec.exam_board_id).single(),
  ]);
  if (!subject || !examBoard) return null;

  return { topic, subject, examBoard };
}
