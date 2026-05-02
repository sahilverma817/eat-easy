import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { errorResponse, HttpError, requireUser } from "@/lib/session";
import { logMealForUser } from "@/lib/meal-log";
import { ADD_ONS, FOODS, filterFoodsForUser, getFood } from "@/lib/foods";
import type { Meal, MealType, Portion } from "@/lib/types";

const VALID_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

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
    const mealType = body.mealType as MealType;
    const description = String(body.description || "").trim();

    if (!VALID_MEAL_TYPES.includes(mealType)) {
      throw new HttpError(400, "Invalid meal type.");
    }
    if (!description) {
      throw new HttpError(400, "Tell us what you ate.");
    }
    if (description.length > 240) {
      throw new HttpError(400, "Keep it under 240 characters.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpError(503, "AI is unavailable, use the picker.");
    }

    // Build food list scoped to user's prefs + meal-type compatibility
    const candidates = filterFoodsForUser({
      foodPreference: user.foodPreference,
      cuisinePreference: user.cuisinePreference,
    }).filter((f) => f.category.includes(mealType));

    // Fallback: if cuisine filter is too tight (e.g. snack with no matches), broaden to all veg/jain-compatible foods that match meal type
    const foodList = (candidates.length > 0
      ? candidates
      : FOODS.filter((f) => {
          if (user.foodPreference === "veg" && !f.veg) return false;
          if (user.foodPreference === "jain" && !f.jain) return false;
          return f.category.includes(mealType);
        })
    ).map((f) => ({ id: f.id, name: f.name, tags: f.tags }));

    const addOnList = ADD_ONS.map((a) => ({ id: a.id, label: a.label }));

    const today = user.todayDate;
    const todayMeals = user.meals.filter((m) => m.date === today);
    const otherMealsLine =
      todayMeals
        .slice(0, 6)
        .map((m) => `${m.mealType}: ${m.foodName}`)
        .join("; ") || "nothing else yet";

    const prompt = `You parse Indian-meal descriptions for the Eat Easy app and give a tiny coaching insight.

User's description: "${description}"
Meal type: ${mealType}
User's goal: ${GOAL_LABEL[user.goal] || "eat better"}
Other meals today: ${otherMealsLine}
Food preference: ${user.foodPreference}

Available foods (pick the closest matching id):
${JSON.stringify(foodList)}

Available add-ons (only use ids from this list):
${JSON.stringify(addOnList)}

Return JSON with these fields:
- foodId: the id of the closest matching food from the list above. If nothing fits, pick the most reasonable approximate match.
- portion: "small", "medium", or "large". Default "medium" if not stated.
- addOns: array of add-on ids that are clearly mentioned. Empty array if none. Use only ids from the add-ons list.
- insight: 2 short sentences. Indian English, casual, warm, practical. First sentence: comment on the meal in context of the day. Second sentence: one tiny tweak suggestion. No emojis. No medical advice. No calorie counts.`;

    let parsed: { foodId: string; portion: Portion; addOns: string[]; insight: string };
    try {
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 400,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            required: ["foodId", "portion", "addOns", "insight"],
            properties: {
              foodId: { type: "string" },
              portion: { type: "string", enum: ["small", "medium", "large"] },
              addOns: { type: "array", items: { type: "string" } },
              insight: { type: "string" },
            },
          } as any,
        },
      });
      const text = (res.text || "").trim();
      if (!text) throw new Error("Empty response");
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("Gemini describe error", err);
      throw new HttpError(503, "Couldn't read your meal — try the picker.");
    }

    // Validate foodId exists
    const food = getFood(parsed.foodId);
    if (!food) {
      throw new HttpError(422, "Couldn't match your meal to anything we know — try the picker.");
    }

    // Validate portion
    const portion: Portion = ["small", "medium", "large"].includes(parsed.portion)
      ? parsed.portion
      : "medium";

    // Validate add-ons (drop any unknown ids)
    const addOnIds = new Set(ADD_ONS.map((a) => a.id));
    const cleanAddOns = (Array.isArray(parsed.addOns) ? parsed.addOns : []).filter((x) =>
      addOnIds.has(x)
    );

    const insight = (parsed.insight || food.feedbackTemplate).trim();

    const { meal, user: updated } = await logMealForUser(user, {
      mealType,
      foodId: food.id,
      portion,
      addOns: cleanAddOns,
    });

    const { pinHash, ...rest } = updated;
    return NextResponse.json({
      ok: true,
      matched: {
        foodId: food.id,
        foodName: food.name,
        portion,
        addOns: cleanAddOns,
      },
      meal,
      user: rest,
      insight,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
