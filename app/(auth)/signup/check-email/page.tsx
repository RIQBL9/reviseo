import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <AuthShell title="Check your email" description="">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-brand/10">
          <MailCheck className="size-8 text-brand" />
        </div>
        <p className="text-sm text-ink-muted">
          We&apos;ve sent you a confirmation link. Click it to verify your account and
          start setting up your subjects.
        </p>
        <Button href="/login" variant="secondary" fullWidth>
          Back to log in
        </Button>
      </div>
    </AuthShell>
  );
}
