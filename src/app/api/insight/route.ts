import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/session";
import { getFood } from "@/lib/foods";
import { GoogleGenAI } from "@google/genai";

const GOAL_LABEL: Record<string, string> = {
  "eat-cleaner": "eat cleaner",
  "lose-weight": "lose weight gradually",
  "gain-energy": "gain energy",
  "reduce-junk": "cut down on junk",
  "build-routine": "build a daily food routine",
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const foodId = String(body.foodId || "");
    const portion = String(body.portion || "medium");
    const addOns: string[] = Array.isArray(body.addOns) ? body.addOns : [];
    const mealType = String(body.mealType || "");

    const food = getFood(foodId);
    if (!food) {
      return NextResponse.json({ insight: "Logged. Try to add a fruit or salad somewhere today." });
    }

    const fallback = food.feedbackTemplate;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ insight: fallback });
    }

    const today = user.todayDate;
    const todayMeals = user.meals.filter((m) => m.date === today);
    const others = todayMeals
      .slice(0, 6)
      .map((m) => `${m.mealType}: ${m.foodName}`)
      .join("; ") || "nothing else yet";

    const prompt = `You are Eat Easy, a friendly Indian food coach for college students.
The user just logged: ${food.name} (${portion} portion) for ${mealType || "a meal"}.
Add-ons: ${addOns.length ? addOns.join(", ") : "none"}.
Other meals today: ${others}.
The user's goal is to ${GOAL_LABEL[user.goal] || "eat better"}.

Reply in 2 short sentences max. Be specific, warm, practical, casual — Indian English.
First sentence: comment on the choice given the day so far.
Second sentence: one tiny tweak or pairing suggestion.
Do not use emojis. Do not give medical advice. Do not mention calories or macros.`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.7, maxOutputTokens: 120 },
      });
      const text = (res.text || "").trim();
      if (!text) return NextResponse.json({ insight: fallback });
      return NextResponse.json({ insight: text });
    } catch (err) {
      console.error("Gemini error", err);
      return NextResponse.json({ insight: fallback });
    }
  } catch (e) {
    return errorResponse(e);
  }
}
