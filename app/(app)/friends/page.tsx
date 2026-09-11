import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFriendsData } from "@/lib/data/friends";
import { FriendSearch } from "@/components/friends/FriendSearch";
import { FriendRequests } from "@/components/friends/FriendRequests";
import { FriendsList } from "@/components/friends/FriendsList";

export const metadata: Metadata = { title: "Friends" };

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { friends, incoming } = await getFriendsData(supabase, user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Friends</h1>
        <p className="mt-1 text-ink-muted">Add classmates to compare progress and climb the leaderboard together.</p>
      </div>

      <FriendSearch />
      <FriendRequests requests={incoming} />

      <div>
        <p className="mb-2 text-sm font-bold text-ink">
          Your friends {friends.length > 0 && <span className="text-ink-muted">({friends.length})</span>}
        </p>
        <FriendsList friends={friends} />
      </div>
    </div>
  );
}
