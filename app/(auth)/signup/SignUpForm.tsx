"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signUpAction, type AuthActionState } from "@/app/(auth)/actions";
import { Field, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && (
        <div className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
          {state.error}
        </div>
      )}

      <Field label="Your name" htmlFor="displayName" error={state.fieldErrors?.displayName}>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          placeholder="Amelia"
          error={state.fieldErrors?.displayName}
        />
      </Field>

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

      <Field
        label="Password"
        htmlFor="password"
        error={state.fieldErrors?.password}
        hint="At least 8 characters, with an uppercase letter and a number."
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          error={state.fieldErrors?.password}
        />
      </Field>

      <Field label="Confirm password" htmlFor="confirmPassword" error={state.fieldErrors?.confirmPassword}>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={state.fieldErrors?.confirmPassword}
        />
      </Field>

      <Button type="submit" fullWidth size="lg" loading={pending} icon={<UserPlus className="size-4" />}>
        Create account
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
          Log in
        </Link>
      </p>
    </form>
  );
}
