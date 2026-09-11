"use client";

import { useState, useTransition } from "react";
import { Search, UserPlus, Check, Clock } from "lucide-react";
import { searchUsersAction, sendFriendRequestAction, type FriendSearchResult } from "@/lib/actions/friends";
import { Input } from "@/components/ui/Input";

export function FriendSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendSearchResult[]>([]);
  const [pending, startTransition] = useTransition();
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const res = await searchUsersAction(value);
      if (!("error" in res)) setResults(res);
    });
  }

  function handleAdd(id: string) {
    setSentIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await sendFriendRequestAction(id);
    });
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by username"
          className="pl-11"
        />
      </div>

      {query.trim().length >= 2 && (
        <div className="mt-3 space-y-2">
          {!pending && results.length === 0 && (
            <p className="px-1 text-sm text-ink-muted">No students found with that username.</p>
          )}
          {results.map((result) => {
            const alreadySent = sentIds.has(result.id) || result.status !== "none";
            return (
              <div key={result.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                  {result.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{result.displayName}</p>
                  <p className="truncate text-xs text-ink-muted">@{result.username}</p>
                </div>
                {result.status === "friends" ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-success">
                    <Check className="size-3.5" />
                    Friends
                  </span>
                ) : alreadySent ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-ink-muted">
                    <Clock className="size-3.5" />
                    Pending
                  </span>
                ) : (
                  <button
                    onClick={() => handleAdd(result.id)}
                    className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white"
                  >
                    <UserPlus className="size-3.5" />
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
