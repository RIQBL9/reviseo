import { Flame, Zap, Trophy, Target } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";

const STATS = [
  { icon: Flame, value: "8", label: "day streak", color: "var(--color-flame)", soft: "bg-flame-soft" },
  { icon: Zap, value: "1,240", label: "total XP", color: "var(--color-xp)", soft: "bg-xp-soft" },
  { icon: Trophy, value: "12", label: "achievements", color: "var(--color-brand)", soft: "bg-brand/10" },
] as const;

export function GamificationSection() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-pill bg-flame-soft px-3.5 py-1.5 text-xs font-bold text-flame">
            <Flame className="size-3.5" fill="currentColor" />
            Built to keep you coming back
          </div>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Revision that rewards showing up
          </h2>
          <p className="mt-4 max-w-lg text-lg text-ink-muted">
            Every genuine revision session — not just logging in — earns XP, keeps your
            streak alive and nudges your topic mastery up. Small wins, made visible.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-card border border-border bg-surface p-4 text-center">
                <div className={`mx-auto flex size-10 items-center justify-center rounded-xl ${stat.soft}`}>
                  <stat.icon className="size-5" style={{ color: stat.color }} fill={stat.icon === Flame ? "currentColor" : "none"} />
                </div>
                <p className="mt-2.5 text-xl font-extrabold text-ink">{stat.value}</p>
                <p className="text-xs font-medium text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_30px_60px_-25px_rgba(30,27,58,0.3)]">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Topic mastery</p>
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing value={74} size={88} strokeWidth={8} color="var(--color-biology)">
                <span className="text-lg font-extrabold text-ink">74%</span>
              </ProgressRing>
              <div>
                <p className="font-bold text-ink">Bioenergetics</p>
                <p className="text-sm text-ink-muted">Confident</p>
                <p className="mt-1 text-xs font-semibold text-success">↑ 12% this week</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-success-soft px-4 py-3">
              <Target className="size-5 text-success" />
              <div>
                <p className="text-sm font-bold text-success">Daily goal complete</p>
                <p className="text-xs text-success/80">+20 XP bonus earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
