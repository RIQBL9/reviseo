"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Flame, Zap, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PRIMARY_NAV } from "@/lib/nav";
import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

interface SidebarProps {
  displayName: string;
  username: string;
  currentStreak: number;
  totalXp: number;
}

export function Sidebar({ displayName, username, currentStreak, totalXp }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
      <Link href="/dashboard" className="px-2">
        <Logo markSize={30} />
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {PRIMARY_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              <item.icon className="size-4.5" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-pill bg-flame-soft px-2.5 py-1 text-xs font-bold text-flame">
            <Flame className="size-3.5" fill="currentColor" />
            {currentStreak}
          </div>
          <div className="flex items-center gap-1 rounded-pill bg-xp-soft px-2.5 py-1 text-xs font-bold text-amber-600">
            <Zap className="size-3.5" fill="currentColor" />
            {totalXp}
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl px-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{displayName}</p>
            <p className="truncate text-xs text-ink-muted">@{username}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-danger"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
