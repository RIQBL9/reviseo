import { Compass } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand/10">
        <Compass className="size-8 text-brand" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Page not found</h1>
        <p className="mt-2 max-w-sm text-ink-muted">
          That page doesn&apos;t exist, or you may not have access to it.
        </p>
      </div>
      <Button href="/dashboard">Back to dashboard</Button>
    </div>
  );
}
