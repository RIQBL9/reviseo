import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTopicWithContext } from "@/lib/data/topic-detail";
import { QuizSession } from "@/components/practice/QuizSession";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PenTool } from "lucide-react";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticePage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const context = await getTopicWithContext(supabase, user.id, topicId);
  if (!context) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_type, prompt, options, correct_answer, explanation")
    .eq("topic_id", topicId);

  if (!questions || questions.length === 0) {
    return (
      <EmptyState
        icon={PenTool}
        title="No practice questions yet"
        description={`We haven't added practice questions for ${context.topic.name} yet.`}
        action={
          <Button href={`/subjects/${context.subject.slug}`} size="sm">
            Back to {context.subject.name}
          </Button>
        }
      />
    );
  }

  return (
    <QuizSession
      topicId={topicId}
      topicName={context.topic.name}
      questions={questions.map((q) => ({
        id: q.id,
        questionType: q.question_type,
        prompt: q.prompt,
        options: q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      }))}
    />
  );
}
