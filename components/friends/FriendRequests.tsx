"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { respondToFriendRequestAction } from "@/lib/actions/friends";
import type { FriendEntry } from "@/lib/data/friends";

export function FriendRequests({ requests }: { requests: FriendEntry[] }) {
  const [pending, startTransition] = useTransition();

  if (requests.length === 0) return null;

  function respond(friendshipId: string, accept: boolean) {
    startTransition(async () => {
      await respondToFriendRequestAction(friendshipId, accept);
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-ink">Friend requests</p>
      {requests.map((request) => (
        <div key={request.friendshipId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
            {request.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{request.displayName}</p>
            <p className="truncate text-xs text-ink-muted">@{request.username}</p>
          </div>
          <button
            disabled={pending}
            onClick={() => respond(request.friendshipId, true)}
            className="flex size-8 items-center justify-center rounded-full bg-success-soft text-success disabled:opacity-50"
            aria-label="Accept"
          >
            <Check className="size-4" />
          </button>
          <button
            disabled={pending}
            onClick={() => respond(request.friendshipId, false)}
            className="flex size-8 items-center justify-center rounded-full bg-danger-soft text-danger disabled:opacity-50"
            aria-label="Decline"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
