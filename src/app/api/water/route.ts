import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/session";
import { setUser } from "@/lib/redis";
import { recomputeTodayScore } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const delta = Number(body.delta) || 1;
    user.waterCount = Math.max(0, Math.min(8, user.waterCount + delta));
    if (user.waterCount === 8 && !user.badges.includes("hydration-hero-day")) {
      user.coins += 10;
      // Don't add badge per day; this is a daily 'tag' reset implicitly. Keep it simple, just coin reward.
    }
    user.todayScore = recomputeTodayScore(user);
    await setUser(user);
    const { pinHash, ...rest } = user;
    return NextResponse.json({ ok: true, user: rest });
  } catch (e) {
    return errorResponse(e);
  }
}
