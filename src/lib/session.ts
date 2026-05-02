import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser, setSession, deleteSession, getUser, setUser } from "./redis";
import { newDayRollover } from "./scoring";
import type { User } from "./types";

const COOKIE_NAME = "ee_session";
const ALG = "HS256";

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET || "dev-secret-change-me-in-production-please-32b";
  return new TextEncoder().encode(s);
}

export async function createSessionCookie(username: string): Promise<{ name: string; value: string; options: any }> {
  const sid = crypto.randomUUID();
  await setSession(sid, username);
  const token = await new SignJWT({ sid, u: username })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}

export async function setSessionCookieOnResponse(res: NextResponse, username: string): Promise<NextResponse> {
  const c = await createSessionCookie(username);
  res.cookies.set(c.name, c.value, c.options);
  return res;
}

export async function clearSessionCookieOnResponse(res: NextResponse): Promise<NextResponse> {
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

export async function getCurrentUsername(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const sid = payload.sid as string | undefined;
    if (!sid) return null;
    const username = await getSessionUser(sid);
    return username;
  } catch {
    return null;
  }
}

export async function logoutCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return;
  try {
    const { payload } = await jwtVerify(token, secret());
    const sid = payload.sid as string | undefined;
    if (sid) await deleteSession(sid);
  } catch {
    /* ignore */
  }
}

export async function requireUser(): Promise<User> {
  const username = await getCurrentUsername();
  if (!username) throw new HttpError(401, "Not authenticated");
  const user = await getUser(username);
  if (!user) throw new HttpError(401, "User missing");
  // Roll over day if needed
  const rolled = newDayRollover(user);
  if (rolled.todayDate !== user.todayDate) {
    await setUser(rolled);
    return rolled;
  }
  return user;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}
