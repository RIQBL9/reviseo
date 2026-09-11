import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserTopicGroups } from "@/lib/data/topic-browser";
import { TopicBrowserList } from "@/components/revision/TopicBrowserList";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticeIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const groups = await getUserTopicGroups(supabase, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Practice</h1>
        <p className="mt-1 text-ink-muted">Test yourself with quiz questions from your topics.</p>
      </div>
      <TopicBrowserList groups={groups} mode="practice" />
    </div>
  );
}
