import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Zap, Flame, Target, Clock, CheckCircle2, Percent } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProgressData } from "@/lib/data/progress";
import { StatCard } from "@/components/progress/StatCard";
import { WeeklyActivityChart } from "@/components/progress/WeeklyActivityChart";
import { SubjectMasteryList } from "@/components/progress/SubjectMasteryList";
import { formatMinutes } from "@/lib/utils";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getProgressData(supabase, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Your progress</h1>
        <p className="mt-1 text-ink-muted">A look at how your revision is paying off.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Zap} label="Total XP" value={data.totalXp.toLocaleString()} softClassName="bg-xp-soft" iconClassName="text-amber-500" />
        <StatCard icon={Flame} label="Day streak" value={String(data.currentStreak)} softClassName="bg-flame-soft" iconClassName="text-flame" />
        <StatCard icon={Target} label="Overall mastery" value={`${data.overallMasteryPct}%`} />
        <StatCard icon={Percent} label="Accuracy" value={`${data.accuracyPct}%`} softClassName="bg-success-soft" iconClassName="text-success" />
        <StatCard icon={Clock} label="Time revising" value={formatMinutes(data.revisionMinutes * 60)} softClassName="bg-info-soft" iconClassName="text-info" />
        <StatCard icon={CheckCircle2} label="Topics started" value={`${data.topicsCompleted}/${data.topicsTotal}`} />
      </div>

      <WeeklyActivityChart data={data.weeklyXp} />

      {data.subjects.length > 0 && <SubjectMasteryList subjects={data.subjects} />}
    </div>
  );
}
