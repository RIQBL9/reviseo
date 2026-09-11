"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, LogOut, X } from "lucide-react";
import { MOBILE_PRIMARY_NAV, MOBILE_MORE_NAV } from "@/lib/nav";
import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = MOBILE_MORE_NAV.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 flex items-end lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setMoreOpen(false)} />
          <div className="relative w-full rounded-t-3xl border-t border-border bg-surface p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl">
            <div className="flex items-center justify-between px-1 pb-2">
              <p className="text-sm font-bold text-ink">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted"
                aria-label="Close menu"
              >
                <X className="size-4.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_MORE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-2.5 rounded-2xl border border-border p-3.5 text-sm font-semibold text-ink"
                >
                  <item.icon className="size-4.5 text-brand" strokeWidth={2.25} />
                  {item.label}
                </Link>
              ))}
            </div>
            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-2xl border border-border p-3.5 text-sm font-semibold text-danger"
              >
                <LogOut className="size-4.5" />
                Log out
              </button>
            </form>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {MOBILE_PRIMARY_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                active ? "text-brand" : "text-ink-muted",
              )}
            >
              <item.icon className="size-5" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
            moreActive ? "text-brand" : "text-ink-muted",
          )}
        >
          <MoreHorizontal className="size-5" strokeWidth={2.25} />
          More
        </button>
      </nav>
    </>
  );
}
