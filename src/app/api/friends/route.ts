import { NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/session";
import { getUser } from "@/lib/redis";
import { avatarStateFor } from "@/lib/scoring";
import type { FriendView } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();
    const friends = await Promise.all(
      user.friends.map(async (uname) => {
        const f = await getUser(uname);
        if (!f) return null;
        const view: FriendView = {
          username: f.username,
          displayName: f.displayName,
          todayScore: f.todayScore,
          streak: f.streak,
          avatarLevel: f.avatarLevel,
          unlockedAccessories: f.unlockedAccessories,
          avatarState: avatarStateFor(f.todayScore),
        };
        return view;
      })
    );

    const requestsIn = await Promise.all(
      user.friendRequestsIn.map(async (uname) => {
        const f = await getUser(uname);
        if (!f) return null;
        return { username: f.username, displayName: f.displayName };
      })
    );

    return NextResponse.json({
      friends: friends.filter(Boolean),
      requestsIn: requestsIn.filter(Boolean),
      requestsOut: user.friendRequestsOut,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
