import Link from "next/link";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { DashboardSubjectSummary } from "@/lib/data/dashboard";

export function SubjectCard({ subject, examBoard, targetGrade, masteryPct, completionPct }: DashboardSubjectSummary) {
  const Icon = getSubjectIcon(subject.icon);
  const theme = getSubjectTheme(subject.color_theme);

  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className="group flex flex-col gap-4 rounded-card border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgba(30,27,58,0.25)]"
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex size-12 items-center justify-center rounded-2xl", theme.soft)}>
          <Icon className={cn("size-6", theme.base.split(" ")[0])} strokeWidth={2.25} />
        </div>
        <ProgressRing value={masteryPct} size={44} strokeWidth={4} color={`var(--color-${subject.color_theme})`}>
          <span className="text-xs font-extrabold text-ink">{masteryPct}%</span>
        </ProgressRing>
      </div>

      <div>
        <p className="font-bold text-ink">{subject.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral">{examBoard.name}</Badge>
          {targetGrade && <Badge variant="brand">Target: {targetGrade}</Badge>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>Completion</span>
          <span>{completionPct}%</span>
        </div>
        <ProgressBar value={completionPct} className="mt-1.5" barClassName={theme.base.split(" ")[1]} />
      </div>
    </Link>
  );
}
