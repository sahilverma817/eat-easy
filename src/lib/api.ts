"use client";

import useSWR, { mutate } from "swr";
import type { User, Nudge, FriendView, FeedEvent, FriendProfile } from "./types";

export const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err = new Error(`API error ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }
  return res.json();
};

export type MeResponse = { user: Omit<User, "pinHash">; nudgeCount: number };

export function useMe() {
  return useSWR<MeResponse>("/api/me", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });
}

export function useFriends() {
  return useSWR<{
    friends: FriendView[];
    feed: FeedEvent[];
    requestsIn: { username: string; displayName: string }[];
    requestsOut: string[];
  }>("/api/friends", fetcher, { refreshInterval: 30000 });
}

export function useFriendProfile(username: string | null | undefined) {
  return useSWR<{ profile: FriendProfile }>(
    username ? `/api/friends/${username}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );
}

export async function postJSON<T = any>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function refreshAll() {
  await Promise.all([mutate("/api/me"), mutate("/api/friends")]);
}

export async function fetchNudges(): Promise<Nudge[]> {
  const res = await fetch("/api/nudges", { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.nudges || [];
}
