import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/(auth)/actions";
import { ProfileForm } from "@/app/(app)/settings/ProfileForm";
import { SubjectsManager } from "@/app/(app)/settings/SubjectsManager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: allSubjects }, { data: examBoards }, { data: subjectExamBoards }, { data: userSubjects }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("subjects").select("*").order("sort_order"),
      supabase.from("exam_boards").select("*").order("name"),
      supabase.from("subject_exam_boards").select("*"),
      supabase.from("user_subjects").select("*").eq("user_id", user.id),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-ink-muted">Manage your profile, subjects and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How your name and username appear across Reviseo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            displayName={profile?.display_name ?? ""}
            username={profile?.username ?? ""}
            dailyXpGoal={profile?.daily_xp_goal ?? 50}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects &amp; exam boards</CardTitle>
          <CardDescription>Add, remove or update your subjects, boards and target grades.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectsManager
            allSubjects={allSubjects ?? []}
            examBoards={examBoards ?? []}
            subjectExamBoards={subjectExamBoards ?? []}
            initial={(userSubjects ?? []).map((us) => ({
              subjectId: us.subject_id,
              examBoardId: us.exam_board_id,
              targetGrade: us.target_grade,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={logoutAction}>
            <Button type="submit" variant="danger" icon={<LogOut className="size-4" />}>
              Log out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
