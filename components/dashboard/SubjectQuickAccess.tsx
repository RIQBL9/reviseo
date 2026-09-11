import Link from "next/link";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { cn } from "@/lib/utils";
import type { DashboardSubjectSummary } from "@/lib/data/dashboard";

export function SubjectQuickAccess({ subjects }: { subjects: DashboardSubjectSummary[] }) {
  return (
    <div>
      <p className="mb-3 font-bold text-ink">Your subjects</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {subjects.map(({ subject, masteryPct }) => {
          const Icon = getSubjectIcon(subject.icon);
          const theme = getSubjectTheme(subject.color_theme);
          return (
            <Link
              key={subject.id}
              href={`/subjects/${subject.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <ProgressRing value={masteryPct} size={40} strokeWidth={4} color={`var(--color-${subject.color_theme})`}>
                <Icon className={cn("size-4", theme.base.split(" ")[0])} />
              </ProgressRing>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{subject.name}</p>
                <p className="text-xs text-ink-muted">{masteryPct}% mastery</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
