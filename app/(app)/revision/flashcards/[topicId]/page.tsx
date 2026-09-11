import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTopicWithContext } from "@/lib/data/topic-detail";
import { FlashcardSession } from "@/components/revision/FlashcardSession";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Layers } from "lucide-react";

export const metadata: Metadata = { title: "Flashcards" };

export default async function FlashcardsPage({
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

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("id, question, answer")
    .eq("topic_id", topicId)
    .order("sort_order");

  if (!flashcards || flashcards.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No flashcards yet"
        description={`We haven't added flashcards for ${context.topic.name} yet.`}
        action={
          <Button href={`/subjects/${context.subject.slug}`} size="sm">
            Back to {context.subject.name}
          </Button>
        }
      />
    );
  }

  return (
    <FlashcardSession
      topicId={topicId}
      topicName={context.topic.name}
      color={`var(--color-${context.subject.color_theme})`}
      cards={flashcards}
    />
  );
}
