import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:pt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-brand-dark">
            <Sparkles className="size-3.5" />
            Built for GCSE Year 10 &amp; 11
          </div>

          <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Revision that actually feels good to come back to.
          </h1>

          <p className="mt-5 max-w-xl text-balance text-lg text-ink-muted">
            Pick your subjects and exam boards, and Reviseo turns the real specification
            into flashcards, quizzes and bite-sized topics — with streaks, XP and progress
            tracking that make revising feel like getting somewhere.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/signup" size="lg">
              Get started — it&apos;s free
            </Button>
            <Button href="/login" variant="secondary" size="lg">
              Log in
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            <span className="font-semibold text-ink">Supports:</span>
            <span>AQA</span>
            <span>Pearson Edexcel</span>
            <span>OCR</span>
            <span>WJEC / Eduqas</span>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}
