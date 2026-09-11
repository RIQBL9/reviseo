"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Send, MailCheck } from "lucide-react";
import { forgotPasswordAction, type AuthActionState } from "@/app/(auth)/actions";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-brand/10">
          <MailCheck className="size-8 text-brand" />
        </div>
        <p className="text-sm text-ink-muted">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Button href="/login" variant="secondary" fullWidth>
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && (
        <div className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
          {state.error}
        </div>
      )}

      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={state.fieldErrors?.email}
        />
      </Field>

      <Button type="submit" fullWidth size="lg" loading={pending} icon={<Send className="size-4" />}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
          Log in
        </Link>
      </p>
    </form>
  );
}
