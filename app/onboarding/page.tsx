import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = { title: "Set up your account" };

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: subjects }, { data: examBoards }, { data: subjectExamBoards }] =
    await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user.id).single(),
      supabase.from("subjects").select("*").order("sort_order"),
      supabase.from("exam_boards").select("*").order("name"),
      supabase.from("subject_exam_boards").select("*"),
    ]);

  return (
    <div className="min-h-dvh bg-bg">
      <OnboardingWizard
        displayName={profile?.display_name ?? "there"}
        subjects={subjects ?? []}
        examBoards={examBoards ?? []}
        subjectExamBoards={subjectExamBoards ?? []}
      />
    </div>
  );
}
