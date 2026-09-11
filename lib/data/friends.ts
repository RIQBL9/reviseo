import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export interface FriendEntry {
  friendshipId: string;
  id: string;
  username: string;
  displayName: string;
  totalXp: number;
  currentStreak: number;
}

export interface FriendsData {
  friends: FriendEntry[];
  incoming: FriendEntry[];
  outgoing: FriendEntry[];
}

export async function getFriendsData(supabase: SupabaseClient<Database>, userId: string): Promise<FriendsData> {
  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (!friendships || friendships.length === 0) return { friends: [], incoming: [], outgoing: [] };

  const otherIds = friendships.map((f) => (f.requester_id === userId ? f.addressee_id : f.requester_id));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, total_xp, current_streak")
    .in("id", otherIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const friends: FriendEntry[] = [];
  const incoming: FriendEntry[] = [];
  const outgoing: FriendEntry[] = [];

  for (const f of friendships) {
    const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
    const profile = profileById.get(otherId);
    if (!profile) continue;

    const entry: FriendEntry = {
      friendshipId: f.id,
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name,
      totalXp: profile.total_xp,
      currentStreak: profile.current_streak,
    };

    if (f.status === "accepted") friends.push(entry);
    else if (f.status === "pending" && f.addressee_id === userId) incoming.push(entry);
    else if (f.status === "pending" && f.requester_id === userId) outgoing.push(entry);
  }

  return { friends, incoming, outgoing };
}
