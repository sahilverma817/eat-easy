import { Redis } from "@upstash/redis";
import type { User, Nudge } from "./types";

let _redis: Redis | null = null;

export function redis(): Redis {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Missing Redis env vars (KV_REST_API_URL / KV_REST_API_TOKEN)");
  }
  _redis = new Redis({ url, token });
  return _redis;
}

const userKey = (username: string) => `user:${username.toLowerCase()}`;
const sessionKey = (sid: string) => `session:${sid}`;
const nudgeKey = (username: string) => `nudge-inbox:${username.toLowerCase()}`;

export async function getUser(username: string): Promise<User | null> {
  const data = await redis().get<User>(userKey(username));
  return data ?? null;
}

export async function setUser(user: User): Promise<void> {
  await redis().set(userKey(user.username), user);
}

export async function userExists(username: string): Promise<boolean> {
  const exists = await redis().exists(userKey(username));
  return exists === 1;
}

export async function setSession(sid: string, username: string, ttlSec = 60 * 60 * 24 * 30): Promise<void> {
  await redis().set(sessionKey(sid), username, { ex: ttlSec });
}

export async function getSessionUser(sid: string): Promise<string | null> {
  const u = await redis().get<string>(sessionKey(sid));
  return u ?? null;
}

export async function deleteSession(sid: string): Promise<void> {
  await redis().del(sessionKey(sid));
}

export async function pushNudge(toUsername: string, nudge: Nudge): Promise<void> {
  await redis().lpush(nudgeKey(toUsername), JSON.stringify(nudge));
  await redis().ltrim(nudgeKey(toUsername), 0, 49);
}

export async function popAllNudges(username: string): Promise<Nudge[]> {
  const items = await redis().lrange<string>(nudgeKey(username), 0, -1);
  await redis().del(nudgeKey(username));
  return items
    .map((s) => {
      try {
        return typeof s === "string" ? (JSON.parse(s) as Nudge) : (s as unknown as Nudge);
      } catch {
        return null;
      }
    })
    .filter((n): n is Nudge => n !== null);
}

export async function peekNudges(username: string): Promise<Nudge[]> {
  const items = await redis().lrange<string>(nudgeKey(username), 0, -1);
  return items
    .map((s) => {
      try {
        return typeof s === "string" ? (JSON.parse(s) as Nudge) : (s as unknown as Nudge);
      } catch {
        return null;
      }
    })
    .filter((n): n is Nudge => n !== null);
}
