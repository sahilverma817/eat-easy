import { NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/session";
import { getUser } from "@/lib/redis";
import { avatarStateFor } from "@/lib/scoring";
import { buildEventsForFriend } from "@/lib/friend-insights";
import { getOrGenerateRecap } from "@/lib/recap-cache";
import type { FeedEvent, FriendView, User } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();

    // Load all friend blobs once
    const friendUsers = (
      await Promise.all(user.friends.map((u) => getUser(u)))
    ).filter((f): f is User => !!f);

    // Generate (or cache-hit) recaps in parallel
    const recaps = await Promise.all(friendUsers.map((f) => getOrGenerateRecap(f)));

    const friends: FriendView[] = friendUsers.map((f, i) => ({
      username: f.username,
      displayName: f.displayName,
      todayScore: f.todayScore,
      streak: f.streak,
      avatarLevel: f.avatarLevel,
      unlockedAccessories: f.unlockedAccessories,
      avatarState: avatarStateFor(f.todayScore),
      recap: recaps[i],
    }));

    // Activity feed across all friends
    const allEvents: FeedEvent[] = friendUsers.flatMap(buildEventsForFriend);
    allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const feed = allEvents.slice(0, 20);

    const requestsIn = await Promise.all(
      user.friendRequestsIn.map(async (uname) => {
        const f = await getUser(uname);
        if (!f) return null;
        return { username: f.username, displayName: f.displayName };
      })
    );

    return NextResponse.json({
      friends,
      feed,
      requestsIn: requestsIn.filter(Boolean),
      requestsOut: user.friendRequestsOut,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
