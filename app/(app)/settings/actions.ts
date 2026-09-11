"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSettingsSchema } from "@/lib/validation";

export interface SettingsActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

export async function updateProfileAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const parsed = profileSettingsSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    dailyXpGoal: formData.get("dailyXpGoal"),
  });

  if (!parsed.success) {
    const flat: Record<string, string> = {};
    for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (messages?.[0]) flat[key] = messages[0];
    }
    return { fieldErrors: flat };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      username: parsed.data.username,
      daily_xp_goal: parsed.data.dailyXpGoal,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { username: "That username is already taken." } };
    }
    return { error: "We couldn't save your changes. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export interface SubjectSelectionInput {
  subjectId: string;
  examBoardId: string;
  targetGrade: number | null;
}

export async function updateUserSubjectsAction(input: {
  subjects: SubjectSelectionInput[];
  removedSubjectIds: string[];
}): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  if (input.removedSubjectIds.length > 0) {
    await supabase
      .from("user_subjects")
      .delete()
      .eq("user_id", user.id)
      .in("subject_id", input.removedSubjectIds);
  }

  if (input.subjects.length > 0) {
    const { error } = await supabase.from("user_subjects").upsert(
      input.subjects.map((s) => ({
        user_id: user.id,
        subject_id: s.subjectId,
        exam_board_id: s.examBoardId,
        target_grade: s.targetGrade,
      })),
      { onConflict: "user_id,subject_id" },
    );
    if (error) return { error: "We couldn't save your subjects. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  return { success: true };
}
