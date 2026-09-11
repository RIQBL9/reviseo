import Link from "next/link";
import { Layers, PenTool, BookOpen } from "lucide-react";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { SubjectTopicGroup } from "@/lib/data/topic-browser";

export function TopicBrowserList({
  groups,
  mode,
}: {
  groups: SubjectTopicGroup[];
  mode: "flashcards" | "practice";
}) {
  const hasTopics = groups.some((g) => g.topics.length > 0);

  if (!hasTopics) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No topics available yet"
        description="Content for your subjects is coming soon — check back shortly."
      />
    );
  }

  return (
    <div className="space-y-8">
      {groups
        .filter((g) => g.topics.length > 0)
        .map((group) => {
          const Icon = getSubjectIcon(group.subject.icon);
          const theme = getSubjectTheme(group.subject.color_theme);
          const color = `var(--color-${group.subject.color_theme})`;

          return (
            <div key={group.subject.id}>
              <div className="flex items-center gap-2.5">
                <div className={cn("flex size-8 items-center justify-center rounded-lg", theme.soft)}>
                  <Icon className={cn("size-4", theme.base.split(" ")[0])} strokeWidth={2.25} />
                </div>
                <p className="font-bold text-ink">{group.subject.name}</p>
              </div>

              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {group.topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={mode === "flashcards" ? `/revision/flashcards/${topic.id}` : `/practice/${topic.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 transition-colors hover:border-brand/40"
                  >
                    <ProgressRing value={topic.masteryScore} size={36} strokeWidth={4} color={color} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{topic.name}</span>
                    {mode === "flashcards" ? (
                      <Layers className="size-4 shrink-0 text-ink-muted" />
                    ) : (
                      <PenTool className="size-4 shrink-0 text-ink-muted" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
