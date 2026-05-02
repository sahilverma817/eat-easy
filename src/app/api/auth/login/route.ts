import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUser } from "@/lib/redis";
import { setSessionCookieOnResponse, errorResponse, HttpError } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { username, pin } = await req.json();
    const u = String(username || "").trim().toLowerCase();
    const p = String(pin || "").trim();
    if (!u || !p) throw new HttpError(400, "Username and PIN required.");
    const user = await getUser(u);
    if (!user) throw new HttpError(401, "Wrong username or PIN.");
    const ok = await bcrypt.compare(p, user.pinHash);
    if (!ok) throw new HttpError(401, "Wrong username or PIN.");
    const { pinHash, ...rest } = user;
    const res = NextResponse.json({ ok: true, user: rest });
    return await setSessionCookieOnResponse(res, u);
  } catch (e) {
    return errorResponse(e);
  }
}
