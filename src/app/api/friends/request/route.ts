import { NextRequest, NextResponse } from "next/server";
import { errorResponse, HttpError, requireUser } from "@/lib/session";
import { getUser, setUser } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { username } = await req.json();
    const target = String(username || "").trim().toLowerCase();
    if (!target) throw new HttpError(400, "Username required.");
    if (target === user.username) throw new HttpError(400, "Can't add yourself.");

    const targetUser = await getUser(target);
    if (!targetUser) throw new HttpError(404, "No such user.");

    if (user.friends.includes(target)) throw new HttpError(409, "Already friends.");
    if (user.friendRequestsOut.includes(target)) throw new HttpError(409, "Already requested.");

    // If incoming request from target exists, auto-accept (mutual)
    if (user.friendRequestsIn.includes(target)) {
      user.friendRequestsIn = user.friendRequestsIn.filter((x) => x !== target);
      user.friends.push(target);
      targetUser.friendRequestsOut = targetUser.friendRequestsOut.filter((x) => x !== user.username);
      targetUser.friends.push(user.username);
      await setUser(user);
      await setUser(targetUser);
      return NextResponse.json({ ok: true, status: "friends" });
    }

    user.friendRequestsOut.push(target);
    targetUser.friendRequestsIn.push(user.username);
    await setUser(user);
    await setUser(targetUser);
    return NextResponse.json({ ok: true, status: "requested" });
  } catch (e) {
    return errorResponse(e);
  }
}
