import { NextRequest, NextResponse } from "next/server";
import { errorResponse, HttpError, requireUser } from "@/lib/session";
import { getUser, pushNudge } from "@/lib/redis";

const ALLOWED_MESSAGES = [
  "Drink water!",
  "Don't break the streak!",
  "Log your meal!",
  "Eat a fruit!",
  "Go for the challenge!",
  "Hi, checking in!",
];

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { username, message } = await req.json();
    const target = String(username || "").trim().toLowerCase();
    const msg = String(message || "Hi, checking in!");
    if (!user.friends.includes(target)) throw new HttpError(403, "Not your friend.");
    const safeMsg = ALLOWED_MESSAGES.includes(msg) ? msg : "Hi, checking in!";
    const targetUser = await getUser(target);
    if (!targetUser) throw new HttpError(404, "User missing.");

    await pushNudge(target, {
      id: crypto.randomUUID(),
      fromUsername: user.username,
      fromDisplayName: user.displayName,
      message: safeMsg,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
