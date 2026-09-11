import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import type { DashboardTopicHighlight } from "@/lib/data/dashboard";

export function ContinueRevisingCard({ highlight }: { highlight: DashboardTopicHighlight | null }) {
  if (!highlight) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Nothing to continue yet"
        description="Head into a subject and start your first revision session."
      />
    );
  }

  const Icon = getSubjectIcon(highlight.subject.icon);
  const theme = getSubjectTheme(highlight.subject.color_theme);

  return (
    <div className="flex items-center gap-4 rounded-card border border-border bg-surface p-5">
      <ProgressRing
        value={highlight.masteryScore}
        size={56}
        strokeWidth={5}
        color={`var(--color-${highlight.subject.color_theme})`}
      >
        <Icon className={cn("size-5.5", theme.base.split(" ")[0])} />
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ink-muted">{highlight.subject.name}</p>
        <p className="truncate font-bold text-ink">{highlight.topic.name}</p>
        <p className="text-xs text-ink-muted">{highlight.masteryScore}% mastered</p>
      </div>
      <Button href={`/practice/${highlight.topic.id}`} size="sm">
        Continue
      </Button>
    </div>
  );
}
