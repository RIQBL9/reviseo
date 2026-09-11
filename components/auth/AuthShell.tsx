import Link from "next/link";
import { ArrowLeft, Flame, Zap, Trophy } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-8 lg:px-14 lg:py-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
            <p className="mt-2 text-sm text-ink-muted">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand via-brand-dark to-physics lg:block">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-8 px-12 text-white">
          <p className="max-w-sm text-balance text-center text-2xl font-bold leading-snug">
            &ldquo;I actually look forward to my Biology revision now.&rdquo;
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 rounded-pill bg-white/15 px-4 py-2 backdrop-blur">
              <Flame className="size-4" fill="currentColor" />
              <span className="text-sm font-bold">12 day streak</span>
            </div>
            <div className="flex items-center gap-2 rounded-pill bg-white/15 px-4 py-2 backdrop-blur">
              <Zap className="size-4" fill="currentColor" />
              <span className="text-sm font-bold">2,180 XP</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-pill bg-white/15 px-4 py-2 backdrop-blur">
            <Trophy className="size-4" />
            <span className="text-sm font-bold">9 achievements unlocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
