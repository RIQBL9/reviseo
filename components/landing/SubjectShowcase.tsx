import { getSubjectTheme } from "@/lib/subjects";
import { getSubjectIcon } from "@/lib/icon-map";
import { MARKETING_SUBJECTS, EXAM_BOARDS } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";

export function SubjectShowcase() {
  return (
    <section id="subjects" className="bg-surface-muted/60 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Your subjects. Your exam boards.
          </h2>
          <p className="mt-3 text-balance text-lg text-ink-muted">
            Every subject is colour-coded so you always know where you are at a glance —
            matched to AQA, Pearson Edexcel, OCR or WJEC / Eduqas.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MARKETING_SUBJECTS.map((subject) => {
            const Icon = getSubjectIcon(subject.icon);
            const theme = getSubjectTheme(subject.theme);
            return (
              <div
                key={subject.name}
                className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-5 text-center transition-transform hover:-translate-y-1"
              >
                <div className={cn("flex size-12 items-center justify-center rounded-2xl", theme.soft)}>
                  <Icon className={cn("size-6", theme.base.split(" ")[0])} strokeWidth={2.25} />
                </div>
                <p className="text-sm font-bold text-ink">{subject.name}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {EXAM_BOARDS.map((board) => (
            <span
              key={board}
              className="rounded-pill border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-muted"
            >
              {board}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
