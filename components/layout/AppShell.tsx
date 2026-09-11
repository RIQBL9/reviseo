import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  displayName: string;
  username: string;
  currentStreak: number;
  totalXp: number;
}

export function AppShell({ children, displayName, username, currentStreak, totalXp }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar displayName={displayName} username={username} currentStreak={currentStreak} totalXp={totalXp} />

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <Link href="/dashboard">
            <Logo markSize={28} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-pill bg-flame-soft px-2.5 py-1 text-xs font-bold text-flame">
              <Flame className="size-3.5" fill="currentColor" />
              {currentStreak}
            </div>
            <div className="flex items-center gap-1 rounded-pill bg-xp-soft px-2.5 py-1 text-xs font-bold text-amber-600">
              <Zap className="size-3.5" fill="currentColor" />
              {totalXp}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
