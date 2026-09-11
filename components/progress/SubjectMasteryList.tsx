import Link from "next/link";
import { getSubjectIcon } from "@/lib/icon-map";
import { getSubjectTheme } from "@/lib/subjects";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import type { DashboardSubjectSummary } from "@/lib/data/dashboard";

export function SubjectMasteryList({ subjects }: { subjects: DashboardSubjectSummary[] }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="font-bold text-ink">Mastery by subject</p>
      <div className="mt-4 space-y-4">
        {subjects.map(({ subject, masteryPct }) => {
          const Icon = getSubjectIcon(subject.icon);
          const theme = getSubjectTheme(subject.color_theme);
          return (
            <Link key={subject.id} href={`/subjects/${subject.slug}`} className="block">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <Icon className={cn("size-4", theme.base.split(" ")[0])} />
                  {subject.name}
                </span>
                <span className="font-bold text-ink-muted">{masteryPct}%</span>
              </div>
              <ProgressBar value={masteryPct} className="mt-1.5" barClassName={theme.base.split(" ")[1]} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
