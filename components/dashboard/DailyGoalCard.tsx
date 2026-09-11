import { Zap, CheckCircle2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function DailyGoalCard({ todayXp, goal }: { todayXp: number; goal: number }) {
  const complete = todayXp >= goal;

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-bold text-ink">Today&apos;s goal</p>
        <span className="flex items-center gap-1 text-sm font-extrabold text-amber-600">
          <Zap className="size-4" fill="currentColor" />
          {Math.min(todayXp, goal)} / {goal} XP
        </span>
      </div>
      <ProgressBar
        value={todayXp}
        max={goal}
        className="mt-3"
        barClassName={complete ? "bg-success" : "bg-gradient-to-r from-xp to-flame"}
      />
      {complete && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-success-soft px-3.5 py-2.5 text-sm font-semibold text-success">
          <CheckCircle2 className="size-4.5" />
          Daily goal complete — nice work!
        </div>
      )}
    </div>
  );
}
