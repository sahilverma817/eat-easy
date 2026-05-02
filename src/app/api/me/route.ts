import { NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/session";
import { peekNudges } from "@/lib/redis";
import { dailyChallengeFor } from "@/lib/challenges";
import { setUser } from "@/lib/redis";

export async function GET() {
  try {
    const user = await requireUser();
    // Make sure today has a challenge assigned
    if (!user.todayChallengeId) {
      const c = dailyChallengeFor(user.username, user.todayDate);
      user.todayChallengeId = c.id;
      user.todayChallengeDone = false;
      await setUser(user);
    }
    const { pinHash, ...rest } = user;
    const nudges = await peekNudges(user.username);
    return NextResponse.json({ user: rest, nudgeCount: nudges.length });
  } catch (e) {
    return errorResponse(e);
  }
}
