"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateProfileAction, type SettingsActionState } from "@/app/(app)/settings/actions";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: SettingsActionState = {};

export function ProfileForm({
  displayName,
  username,
  dailyXpGoal,
}: {
  displayName: string;
  username: string;
  dailyXpGoal: number;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-2xl bg-success-soft px-4 py-3 text-sm font-medium text-success" role="status">
          Saved!
        </div>
      )}

      <Field label="Display name" htmlFor="displayName" error={state.fieldErrors?.displayName}>
        <Input id="displayName" name="displayName" defaultValue={displayName} error={state.fieldErrors?.displayName} />
      </Field>

      <Field
        label="Username"
        htmlFor="username"
        error={state.fieldErrors?.username}
        hint="Lowercase letters, numbers and underscores. Friends will find you by this."
      >
        <Input id="username" name="username" defaultValue={username} error={state.fieldErrors?.username} />
      </Field>

      <Field
        label="Daily XP goal"
        htmlFor="dailyXpGoal"
        error={state.fieldErrors?.dailyXpGoal}
        hint="How much XP you aim to earn each day."
      >
        <Input
          id="dailyXpGoal"
          name="dailyXpGoal"
          type="number"
          min={10}
          max={500}
          step={10}
          defaultValue={dailyXpGoal}
          error={state.fieldErrors?.dailyXpGoal}
        />
      </Field>

      <Button type="submit" loading={pending} icon={<Save className="size-4" />}>
        Save changes
      </Button>
    </form>
  );
}
