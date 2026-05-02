import { NextRequest, NextResponse } from "next/server";
import { errorResponse, HttpError, requireUser } from "@/lib/session";
import { setUser } from "@/lib/redis";
import { dailyChallengeFor, getChallenge } from "@/lib/challenges";
import { recomputeTodayScore } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const id = String(body.challengeId || user.todayChallengeId || "");
    const todayChallenge = dailyChallengeFor(user.username, user.todayDate);
    if (id !== todayChallenge.id) throw new HttpError(400, "Not today's challenge.");
    if (user.todayChallengeDone) throw new HttpError(409, "Already completed.");
    const ch = getChallenge(id);
    if (!ch) throw new HttpError(400, "Unknown challenge.");
    user.todayChallengeDone = true;
    user.todayChallengeId = ch.id;
    user.coins += ch.rewardCoins;
    user.challengeHistory = [
      { id: ch.id, completedAt: new Date().toISOString() },
      ...user.challengeHistory,
    ].slice(0, 60);
    user.todayScore = recomputeTodayScore(user);
    await setUser(user);
    const { pinHash, ...rest } = user;
    return NextResponse.json({ ok: true, user: rest });
  } catch (e) {
    return errorResponse(e);
  }
}
