import { NextRequest, NextResponse } from "next/server";
import { errorResponse, HttpError, requireUser } from "@/lib/session";
import { getUser, setUser } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { username } = await req.json();
    const from = String(username || "").trim().toLowerCase();
    if (!user.friendRequestsIn.includes(from)) throw new HttpError(404, "No such request.");
    const fromUser = await getUser(from);
    if (!fromUser) throw new HttpError(404, "User missing.");

    user.friendRequestsIn = user.friendRequestsIn.filter((x) => x !== from);
    if (!user.friends.includes(from)) user.friends.push(from);

    fromUser.friendRequestsOut = fromUser.friendRequestsOut.filter((x) => x !== user.username);
    if (!fromUser.friends.includes(user.username)) fromUser.friends.push(user.username);

    await setUser(user);
    await setUser(fromUser);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
