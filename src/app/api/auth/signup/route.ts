import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setUser, userExists } from "@/lib/redis";
import { setSessionCookieOnResponse, errorResponse, HttpError } from "@/lib/session";
import { todayISO } from "@/lib/scoring";
import { dailyChallengeFor } from "@/lib/challenges";
import type { User } from "@/lib/types";

const USERNAME_RX = /^[a-z0-9_]{3,15}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username || "").trim().toLowerCase();
    const pin = String(body.pin || "").trim();
    const displayName = String(body.displayName || "").trim();

    if (!USERNAME_RX.test(username)) {
      throw new HttpError(400, "Username must be 3-15 chars, lowercase letters/numbers/underscore.");
    }
    if (!/^\d{4}$/.test(pin)) {
      throw new HttpError(400, "PIN must be 4 digits.");
    }
    if (!displayName || displayName.length > 30) {
      throw new HttpError(400, "Display name required (max 30 chars).");
    }
    if (await userExists(username)) {
      throw new HttpError(409, "Username already taken.");
    }

    const ageGroup = body.ageGroup || "18-24";
    const lifestyle = body.lifestyle || "student";
    const goal = body.goal || "eat-cleaner";
    const foodPreference = body.foodPreference || "veg";
    const cuisinePreference = body.cuisinePreference || "mixed";

    const today = todayISO();
    const challenge = dailyChallengeFor(username, today);

    const user: User = {
      username,
      pinHash: await bcrypt.hash(pin, 10),
      createdAt: new Date().toISOString(),
      displayName,
      ageGroup,
      lifestyle,
      goal,
      foodPreference,
      cuisinePreference,
      todayDate: today,
      todayScore: 50,
      waterCount: 0,
      todayChallengeId: challenge.id,
      todayChallengeDone: false,
      streak: 0,
      longestStreak: 0,
      coins: 50,
      avatarLevel: 1,
      unlockedAccessories: [],
      badges: [],
      meals: [],
      challengeHistory: [],
      friends: [],
      friendRequestsIn: [],
      friendRequestsOut: [],
    };
    await setUser(user);

    const res = NextResponse.json({ ok: true, user: publicSelf(user) });
    return await setSessionCookieOnResponse(res, username);
  } catch (e) {
    return errorResponse(e);
  }
}

function publicSelf(u: User) {
  const { pinHash, ...rest } = u;
  return rest;
}
