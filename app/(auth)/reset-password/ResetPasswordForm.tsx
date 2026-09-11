"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { resetPasswordAction, type AuthActionState } from "@/app/(auth)/actions";
import { Field } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && (
        <div className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
          {state.error}
        </div>
      )}

      <Field
        label="New password"
        htmlFor="password"
        error={state.fieldErrors?.password}
        hint="At least 8 characters, with an uppercase letter and a number."
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a new password"
          error={state.fieldErrors?.password}
        />
      </Field>

      <Field label="Confirm new password" htmlFor="confirmPassword" error={state.fieldErrors?.confirmPassword}>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          error={state.fieldErrors?.confirmPassword}
        />
      </Field>

      <Button type="submit" fullWidth size="lg" loading={pending} icon={<KeyRound className="size-4" />}>
        Reset password
      </Button>
    </form>
  );
}
