"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { YearGroup } from "@/lib/types/database";

export interface OnboardingSubjectInput {
  subjectId: string;
  examBoardId: string;
  targetGrade: number | null;
}

export interface CompleteOnboardingInput {
  yearGroup: YearGroup;
  subjects: OnboardingSubjectInput[];
}

export async function completeOnboardingAction(
  input: CompleteOnboardingInput,
): Promise<{ error?: string } | void> {
  if (input.subjects.length === 0) {
    return { error: "Choose at least one subject to continue." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session expired. Please log in again." };
  }

  const { error: subjectsError } = await supabase.from("user_subjects").upsert(
    input.subjects.map((s) => ({
      user_id: user.id,
      subject_id: s.subjectId,
      exam_board_id: s.examBoardId,
      target_grade: s.targetGrade,
    })),
    { onConflict: "user_id,subject_id" },
  );

  if (subjectsError) {
    return { error: "We couldn't save your subjects. Please try again." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      year_group: input.yearGroup,
      onboarding_completed: true,
      onboarding_step: 6,
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "We couldn't finish setting up your account. Please try again." };
  }

  redirect("/dashboard");
}
