import { NextResponse } from "next/server";
import { clearSessionCookieOnResponse, logoutCurrentSession } from "@/lib/session";

export async function POST() {
  await logoutCurrentSession();
  const res = NextResponse.json({ ok: true });
  return await clearSessionCookieOnResponse(res);
}
