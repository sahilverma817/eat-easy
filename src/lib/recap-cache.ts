import { GoogleGenAI } from "@google/genai";
import { redis } from "./redis";
import { buildRecapPrompt, staticRecapFallback } from "./friend-insights";
import type { User } from "./types";

const RECAP_TTL_SEC = 6 * 60 * 60;

const recapKey = (username: string) => `recap:${username.toLowerCase()}`;

export async function getCachedRecap(username: string): Promise<string | null> {
  const v = await redis().get<string>(recapKey(username));
  return v ?? null;
}

export async function setCachedRecap(username: string, text: string): Promise<void> {
  await redis().set(recapKey(username), text, { ex: RECAP_TTL_SEC });
}

export async function getOrGenerateRecap(friend: User): Promise<string> {
  const cached = await getCachedRecap(friend.username);
  if (cached) return cached;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return staticRecapFallback(friend);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: buildRecapPrompt(friend),
      config: { temperature: 0.5, maxOutputTokens: 80 },
    });
    const text = (res.text || "").trim().replace(/^["']|["']$/g, "");
    if (!text) return staticRecapFallback(friend);
    await setCachedRecap(friend.username, text);
    return text;
  } catch (err) {
    console.error("recap gemini error", err);
    return staticRecapFallback(friend);
  }
}
