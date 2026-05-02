import { NextRequest, NextResponse } from "next/server";
import { errorResponse, HttpError, requireUser } from "@/lib/session";
import { getUser } from "@/lib/redis";
import { avatarStateFor } from "@/lib/scoring";
import { computeWeekStats } from "@/lib/friend-insights";
import { getOrGenerateRecap } from "@/lib/recap-cache";
import type { FriendProfile } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const me = await requireUser();
    const { username } = await params;
    const target = String(username || "").trim().toLowerCase();
    if (!target) throw new HttpError(400, "Bad request.");

    if (!me.friends.includes(target)) {
      throw new HttpError(403, "You're not friends with this person.");
    }

    const friend = await getUser(target);
    if (!friend) throw new HttpError(404, "User not found.");

    const todayMeals = friend.meals.filter((m) => m.date === friend.todayDate);
    const recentMeals = friend.meals.slice(0, 12);
    const weekStats = computeWeekStats(friend);
    const recap = await getOrGenerateRecap(friend);

    const profile: FriendProfile = {
      username: friend.username,
      displayName: friend.displayName,
      todayScore: friend.todayScore,
      streak: friend.streak,
      longestStreak: friend.longestStreak,
      coins: friend.coins,
      avatarLevel: friend.avatarLevel,
      unlockedAccessories: friend.unlockedAccessories,
      waterCount: friend.waterCount,
      badges: friend.badges,
      todayDate: friend.todayDate,
      todayMeals,
      recentMeals,
      weekStats,
      recap,
      avatarState: avatarStateFor(friend.todayScore),
    };

    return NextResponse.json({ profile });
  } catch (e) {
    return errorResponse(e);
  }
}
