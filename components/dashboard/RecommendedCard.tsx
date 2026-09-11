import { Target } from "lucide-react";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { DashboardTopicHighlight } from "@/lib/data/dashboard";

export function RecommendedCard({ highlight }: { highlight: DashboardTopicHighlight | null }) {
  if (!highlight) return null;

  const Icon = getSubjectIcon(highlight.subject.icon);
  const theme = getSubjectTheme(highlight.subject.color_theme);

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
        <Target className="size-3.5" />
        Recommended for you
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className={cn("flex size-11 items-center justify-center rounded-2xl", theme.soft)}>
          <Icon className={cn("size-5", theme.base.split(" ")[0])} strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">{highlight.topic.name}</p>
          <p className="text-sm text-ink-muted">
            You&apos;re at {highlight.masteryScore}% here — a quick session could help.
          </p>
        </div>
      </div>
      <Button href={`/practice/${highlight.topic.id}`} variant="secondary" fullWidth className="mt-4">
        Start revision
      </Button>
    </div>
  );
}
