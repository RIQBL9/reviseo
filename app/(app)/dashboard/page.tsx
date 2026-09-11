import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/data/dashboard";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { DailyGoalCard } from "@/components/dashboard/DailyGoalCard";
import { ContinueRevisingCard } from "@/components/dashboard/ContinueRevisingCard";
import { RecommendedCard } from "@/components/dashboard/RecommendedCard";
import { SubjectQuickAccess } from "@/components/dashboard/SubjectQuickAccess";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, current_streak, daily_xp_goal")
    .eq("id", user.id)
    .single();

  const dashboard = await getDashboardData(supabase, user.id);

  if (dashboard.subjects.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No subjects yet"
        description="Add your GCSE subjects to unlock your personalised dashboard."
        action={
          <Button href="/settings" size="sm">
            Choose subjects
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <GreetingHeader displayName={profile?.display_name ?? "there"} streak={profile?.current_streak ?? 0} />

      <DailyGoalCard todayXp={dashboard.todayXp} goal={profile?.daily_xp_goal ?? 50} />

      <div>
        <p className="mb-3 font-bold text-ink">Continue revising</p>
        <ContinueRevisingCard highlight={dashboard.continueRevising} />
      </div>

      {dashboard.recommended && (
        <div>
          <RecommendedCard highlight={dashboard.recommended} />
        </div>
      )}

      <SubjectQuickAccess subjects={dashboard.subjects} />
    </div>
  );
}
