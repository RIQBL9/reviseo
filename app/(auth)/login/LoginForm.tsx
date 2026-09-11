"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { loginAction, type AuthActionState } from "@/app/(auth)/actions";
import { Field, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

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

      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={state.fieldErrors?.password}
        />
      </Field>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:text-brand-dark">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth size="lg" loading={pending} icon={<Mail className="size-4" />}>
        Log in
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-brand hover:text-brand-dark">
          Sign up
        </Link>
      </p>
    </form>
  );
}
