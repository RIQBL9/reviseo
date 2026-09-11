import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, current_streak, total_xp")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      displayName={profile?.display_name ?? "Student"}
      username={profile?.username ?? "student"}
      currentStreak={profile?.current_streak ?? 0}
      totalXp={profile?.total_xp ?? 0}
    >
      {children}
    </AppShell>
  );
}
