import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/session";
import { getUser, setUser } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { username } = await req.json();
    const from = String(username || "").trim().toLowerCase();
    user.friendRequestsIn = user.friendRequestsIn.filter((x) => x !== from);
    const fromUser = await getUser(from);
    if (fromUser) {
      fromUser.friendRequestsOut = fromUser.friendRequestsOut.filter((x) => x !== user.username);
      await setUser(fromUser);
    }
    await setUser(user);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
