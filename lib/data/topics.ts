import type { Tables, MasteryLevel } from "@/lib/types/database";
import { calculateMasteryScore, masteryLevelFromScore } from "@/lib/mastery";

export interface TopicNode extends Tables<"topics"> {
  children: TopicNode[];
}

export interface TopicProgress {
  masteryScore: number;
  masteryLevel: MasteryLevel;
  questionsAnswered: number;
  questionsCorrect: number;
  flashcardsReviewed: number;
  lastRevisedAt: string | null;
}

export function buildTopicTree(topics: Tables<"topics">[]): TopicNode[] {
  const byId = new Map<string, TopicNode>(topics.map((t) => [t.id, { ...t, children: [] }]));
  const roots: TopicNode[] = [];

  for (const topic of byId.values()) {
    if (topic.parent_topic_id) {
      const parent = byId.get(topic.parent_topic_id);
      if (parent) {
        parent.children.push(topic);
        continue;
      }
    }
    roots.push(topic);
  }

  const bySort = (a: Tables<"topics">, b: Tables<"topics">) => a.sort_order - b.sort_order;
  roots.sort(bySort);
  for (const node of byId.values()) node.children.sort(bySort);

  return roots;
}

/** Topics nobody lists as a parent — these are the ones flashcards/questions actually attach to. */
export function getLeafTopics(topics: Tables<"topics">[]): Tables<"topics">[] {
  const parentIds = new Set(topics.map((t) => t.parent_topic_id).filter(Boolean));
  return topics.filter((t) => !parentIds.has(t.id));
}

export function progressFromRow(row: Tables<"user_topic_progress"> | undefined): TopicProgress {
  if (!row) {
    return {
      masteryScore: 0,
      masteryLevel: "not_started",
      questionsAnswered: 0,
      questionsCorrect: 0,
      flashcardsReviewed: 0,
      lastRevisedAt: null,
    };
  }
  return {
    masteryScore: row.mastery_score,
    masteryLevel: row.mastery_level,
    questionsAnswered: row.questions_answered,
    questionsCorrect: row.questions_correct,
    flashcardsReviewed: row.flashcards_reviewed,
    lastRevisedAt: row.last_revised_at,
  };
}

export function averageMastery(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

export { calculateMasteryScore, masteryLevelFromScore };
