import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserTopicGroups } from "@/lib/data/topic-browser";
import { TopicBrowserList } from "@/components/revision/TopicBrowserList";

export const metadata: Metadata = { title: "Revision" };

export default async function RevisionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const groups = await getUserTopicGroups(supabase, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Revision</h1>
        <p className="mt-1 text-ink-muted">Pick a topic to flip through flashcards.</p>
      </div>
      <TopicBrowserList groups={groups} mode="flashcards" />
    </div>
  );
}
