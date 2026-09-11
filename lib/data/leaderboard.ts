import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  weeklyXp: number;
  totalXp: number;
  isCurrentUser: boolean;
}

export async function getFriendsLeaderboard(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<LeaderboardEntry[]> {
  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const friendIds = (friendships ?? []).map((f) => (f.requester_id === userId ? f.addressee_id : f.requester_id));
  const memberIds = [userId, ...friendIds];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [{ data: profiles }, { data: xpEvents }] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, total_xp").in("id", memberIds),
    supabase
      .from("xp_events")
      .select("user_id, amount")
      .in("user_id", memberIds)
      .gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  const weeklyByUser = new Map<string, number>();
  for (const event of xpEvents ?? []) {
    weeklyByUser.set(event.user_id, (weeklyByUser.get(event.user_id) ?? 0) + event.amount);
  }

  return (profiles ?? [])
    .map((profile) => ({
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name,
      weeklyXp: weeklyByUser.get(profile.id) ?? 0,
      totalXp: profile.total_xp,
      isCurrentUser: profile.id === userId,
    }))
    .sort((a, b) => b.weeklyXp - a.weeklyXp);
}
