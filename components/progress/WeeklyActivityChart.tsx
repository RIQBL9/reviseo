import type { WeeklyPoint } from "@/lib/data/progress";

export function WeeklyActivityChart({ data }: { data: WeeklyPoint[] }) {
  const max = Math.max(...data.map((d) => d.xp), 20);

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="font-bold text-ink">This week&apos;s XP</p>
      <div className="mt-5 flex items-end justify-between gap-2 sm:gap-3" style={{ height: 140 }}>
        {data.map((point) => {
          const heightPct = Math.max((point.xp / max) * 100, point.xp > 0 ? 6 : 2);
          const isToday = point.date === new Date().toISOString().slice(0, 10);
          return (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand to-physics transition-[height] duration-700"
                  style={{ height: `${heightPct}%`, opacity: point.xp > 0 ? 1 : 0.15 }}
                  title={`${point.xp} XP`}
                />
              </div>
              <span className={isToday ? "text-xs font-bold text-brand" : "text-xs font-medium text-ink-muted"}>
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
