import { Flame, Zap, Dna, FlaskConical, Sigma, CheckCircle2 } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg select-none">
      <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-brand/20 via-physics/10 to-biology/20 blur-3xl" />

      <div className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_30px_60px_-25px_rgba(30,27,58,0.35)] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-muted">Good afternoon,</p>
            <p className="text-lg font-extrabold text-ink">Amelia 👋</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-pill bg-flame-soft px-3 py-1.5">
            <Flame className="size-4 text-flame" fill="currentColor" />
            <span className="text-sm font-bold text-flame">8</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-surface-muted p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">Today&apos;s goal</span>
            <span className="flex items-center gap-1 font-bold text-xp">
              <Zap className="size-4" fill="currentColor" />
              40 / 50 XP
            </span>
          </div>
          <ProgressBar value={40} max={50} className="mt-2.5" barClassName="bg-gradient-to-r from-xp to-flame" />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-muted">Continue revising</p>
        <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-border p-3">
          <ProgressRing value={72} size={48} strokeWidth={5} color="var(--color-biology)">
            <Dna className="size-5 text-biology" />
          </ProgressRing>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink">Cell Biology</p>
            <p className="text-xs text-ink-muted">72% mastered</p>
          </div>
          <div className="rounded-full bg-biology px-3 py-1.5 text-xs font-bold text-white">Continue</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-border p-3">
            <ProgressRing value={54} size={38} strokeWidth={4} color="var(--color-chemistry)">
              <FlaskConical className="size-3.5 text-chemistry" />
            </ProgressRing>
            <div>
              <p className="text-xs font-bold text-ink">Chemistry</p>
              <p className="text-[11px] text-ink-muted">54%</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-border p-3">
            <ProgressRing value={31} size={38} strokeWidth={4} color="var(--color-maths)">
              <Sigma className="size-3.5 text-maths" />
            </ProgressRing>
            <div>
              <p className="text-xs font-bold text-ink">Maths</p>
              <p className="text-[11px] text-ink-muted">31%</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-success-soft px-3.5 py-2.5 text-sm font-semibold text-success">
          <CheckCircle2 className="size-4.5" />
          Daily goal complete streak maintained
        </div>
      </div>

      <div className="absolute -right-5 -top-5 flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-3.5 py-2.5 shadow-lg animate-pop-in sm:-right-8">
        <Zap className="size-4 text-xp" fill="currentColor" />
        <span className="text-sm font-extrabold text-ink">+50 XP</span>
      </div>
    </div>
  );
}
