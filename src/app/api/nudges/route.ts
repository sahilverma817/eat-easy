import { NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/session";
import { popAllNudges } from "@/lib/redis";

export async function GET() {
  try {
    const user = await requireUser();
    const nudges = await popAllNudges(user.username);
    return NextResponse.json({ nudges });
  } catch (e) {
    return errorResponse(e);
  }
}
