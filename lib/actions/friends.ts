"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface FriendSearchResult {
  id: string;
  username: string;
  displayName: string;
  totalXp: number;
  status: "none" | "pending_outgoing" | "pending_incoming" | "friends";
}

export async function searchUsersAction(query: string): Promise<FriendSearchResult[] | { error: string }> {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const [{ data: matches }, { data: friendships }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, total_xp")
      .ilike("username", `%${trimmed}%`)
      .neq("id", user.id)
      .limit(10),
    supabase.from("friendships").select("*").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
  ]);

  return (matches ?? []).map((profile) => {
    const friendship = (friendships ?? []).find(
      (f) => f.requester_id === profile.id || f.addressee_id === profile.id,
    );

    let status: FriendSearchResult["status"] = "none";
    if (friendship?.status === "accepted") status = "friends";
    else if (friendship?.status === "pending" && friendship.requester_id === user.id) status = "pending_outgoing";
    else if (friendship?.status === "pending" && friendship.addressee_id === user.id) status = "pending_incoming";

    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name,
      totalXp: profile.total_xp,
      status,
    };
  });
}

export async function sendFriendRequestAction(addresseeId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: addresseeId,
  });

  if (error) return { error: "We couldn't send that friend request." };

  revalidatePath("/friends");
  return {};
}

export async function respondToFriendRequestAction(
  friendshipId: string,
  accept: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .update({ status: accept ? "accepted" : "declined" })
    .eq("id", friendshipId);

  if (error) return { error: "We couldn't update that request." };

  revalidatePath("/friends");
  return {};
}

export async function removeFriendshipAction(friendshipId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  if (error) return { error: "We couldn't remove that friend." };
  revalidatePath("/friends");
  return {};
}
