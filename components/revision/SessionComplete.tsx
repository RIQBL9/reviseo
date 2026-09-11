import { PartyPopper, Zap, Flame, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface SessionCompleteProps {
  topicName: string;
  xpEarned: number;
  streakExtended: boolean;
  currentStreak: number;
  masteryScore: number;
  scoreLabel?: string;
  backHref: string;
}

export function SessionComplete({
  topicName,
  xpEarned,
  streakExtended,
  currentStreak,
  masteryScore,
  scoreLabel,
  backHref,
}: SessionCompleteProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-xp-soft animate-pop-in">
        <PartyPopper className="size-10 text-amber-500" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Session complete!</h1>
      <p className="mt-1.5 text-ink-muted">{topicName}</p>

      <div className="mt-8 grid w-full grid-cols-2 gap-3">
        <div className="rounded-card border border-border bg-surface p-4">
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-xp-soft">
            <Zap className="size-5 text-amber-500" fill="currentColor" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-ink">+{xpEarned}</p>
          <p className="text-xs text-ink-muted">XP earned</p>
        </div>

        {streakExtended ? (
          <div className="rounded-card border border-border bg-surface p-4">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-flame-soft">
              <Flame className="size-5 text-flame" fill="currentColor" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-ink">{currentStreak}</p>
            <p className="text-xs text-ink-muted">day streak</p>
          </div>
        ) : (
          <div className="rounded-card border border-border bg-surface p-4">
            <ProgressRing value={masteryScore} size={40} strokeWidth={4} color="var(--color-brand)" />
            <p className="mt-2 text-xl font-extrabold text-ink">{masteryScore}%</p>
            <p className="text-xs text-ink-muted">topic mastery</p>
          </div>
        )}
      </div>

      {scoreLabel && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-success-soft px-4 py-2.5 text-sm font-semibold text-success">
          <TrendingUp className="size-4.5" />
          {scoreLabel}
        </div>
      )}

      <Button href={backHref} size="lg" fullWidth className="mt-8">
        Back to topic
      </Button>
    </div>
  );
}
