import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Trophy, Zap, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFriendsLeaderboard } from "@/lib/data/leaderboard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Leaderboard" };

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entries = await getFriendsLeaderboard(supabase, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Leaderboard</h1>
        <p className="mt-1 text-ink-muted">Weekly XP among you and your friends — add friends to fill the board.</p>
      </div>

      {entries.length <= 1 ? (
        <EmptyState
          icon={Users}
          title="Add friends to see a leaderboard"
          description="Your leaderboard compares you with your friends only, never the whole world."
          action={
            <Button href="/friends" size="sm">
              Find friends
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5",
                entry.isCurrentUser ? "border-brand bg-brand/5" : "border-border bg-surface",
              )}
            >
              <div className="flex size-8 items-center justify-center">
                {index < 3 ? (
                  <Trophy className={cn("size-5", MEDAL_COLORS[index])} fill="currentColor" />
                ) : (
                  <span className="text-sm font-bold text-ink-muted">{index + 1}</span>
                )}
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                {entry.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">
                  {entry.displayName} {entry.isCurrentUser && <span className="text-ink-muted">(you)</span>}
                </p>
                <p className="truncate text-xs text-ink-muted">@{entry.username}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-extrabold text-amber-600">
                <Zap className="size-4" fill="currentColor" />
                {entry.weeklyXp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
