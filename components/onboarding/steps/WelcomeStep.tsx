import { Sparkles } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function WelcomeStep({ onNext, displayName }: { onNext: () => void; displayName: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-brand/10">
        <LogoMark size={48} />
      </div>
      <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">
        Welcome to Reviseo, {displayName.split(" ")[0]}!
      </h2>
      <p className="mt-3 max-w-sm text-balance text-ink-muted">
        Let&apos;s set up your personal revision space. It only takes a couple of
        minutes — choose your year, subjects and exam boards, and we&apos;ll build
        your dashboard around them.
      </p>
      <Button onClick={onNext} size="lg" className="mt-8" icon={<Sparkles className="size-4" />}>
        Let&apos;s get started
      </Button>
    </div>
  );
}
