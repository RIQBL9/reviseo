"use client";

import { useTransition } from "react";
import { Flame, Zap, UserMinus, Users } from "lucide-react";
import { removeFriendshipAction } from "@/lib/actions/friends";
import type { FriendEntry } from "@/lib/data/friends";
import { EmptyState } from "@/components/ui/EmptyState";

export function FriendsList({ friends }: { friends: FriendEntry[] }) {
  const [pending, startTransition] = useTransition();

  if (friends.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No friends yet"
        description="Search for classmates by username to add them and compare progress."
      />
    );
  }

  function remove(friendshipId: string) {
    startTransition(async () => {
      await removeFriendshipAction(friendshipId);
    });
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div key={friend.friendshipId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
            {friend.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{friend.displayName}</p>
            <p className="truncate text-xs text-ink-muted">@{friend.username}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-flame">
            <Flame className="size-3.5" fill="currentColor" />
            {friend.currentStreak}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
            <Zap className="size-3.5" fill="currentColor" />
            {friend.totalXp}
          </div>
          <button
            disabled={pending}
            onClick={() => remove(friend.friendshipId)}
            className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-danger-soft hover:text-danger disabled:opacity-50"
            aria-label={`Remove ${friend.displayName}`}
          >
            <UserMinus className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
