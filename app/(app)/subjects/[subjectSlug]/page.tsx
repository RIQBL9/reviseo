import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubjectDetail } from "@/lib/data/subject-detail";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/Badge";
import { TopicSection } from "@/components/subjects/TopicSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}): Promise<Metadata> {
  const { subjectSlug } = await params;
  return { title: subjectSlug.replace(/-/g, " ") };
}

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}) {
  const { subjectSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const detail = await getSubjectDetail(supabase, user.id, subjectSlug);
  if (!detail) notFound();

  const Icon = getSubjectIcon(detail.subject.icon);
  const theme = getSubjectTheme(detail.subject.color_theme);
  const color = `var(--color-${detail.subject.color_theme})`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-5">
        <div className={cn("flex size-14 items-center justify-center rounded-2xl", theme.soft)}>
          <Icon className={cn("size-7", theme.base.split(" ")[0])} strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold text-ink">{detail.subject.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="neutral">{detail.examBoard.name}</Badge>
            {detail.targetGrade && <Badge variant="brand">Target grade: {detail.targetGrade}</Badge>}
          </div>
        </div>
        <ProgressRing value={detail.overallMasteryPct} size={64} strokeWidth={6} color={color}>
          <span className="text-sm font-extrabold text-ink">{detail.overallMasteryPct}%</span>
        </ProgressRing>
      </div>

      {detail.topics.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Topics coming soon"
          description="We haven't added content for this specification yet — check back soon."
        />
      ) : (
        <div className="space-y-3">
          {detail.topics.map((topic) => (
            <TopicSection key={topic.id} topic={topic} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}
