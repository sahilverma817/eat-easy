import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const out: any = {
    hasGeminiKey: !!apiKey,
    geminiKeyLength: apiKey ? apiKey.length : 0,
    geminiKeyPrefix: apiKey ? apiKey.slice(0, 4) : null,
    hasRedisUrl: !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL),
    hasRedisToken: !!(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN),
    hasSessionSecret: !!process.env.SESSION_SECRET,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    deploymentUrl: process.env.VERCEL_URL,
    serverTime: new Date().toISOString(),
  };

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Reply with exactly the word: ok",
        config: { temperature: 0, maxOutputTokens: 10 },
      });
      out.geminiTest = {
        ok: true,
        response: (res.text || "").trim().slice(0, 50),
      };
    } catch (err: any) {
      out.geminiTest = {
        ok: false,
        error: err?.message || String(err),
        status: err?.status,
      };
    }
  }

  return NextResponse.json(out);
}
