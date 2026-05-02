import { NextRequest, NextResponse } from "next/server";
import { errorResponse, HttpError, requireUser } from "@/lib/session";
import { setUser } from "@/lib/redis";
import { calcMealScoreChange, isLateNightMeal, recomputeTodayScore, streakMilestoneReward, todayISO } from "@/lib/scoring";
import { getFood } from "@/lib/foods";
import type { Meal } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const mealType = body.mealType as Meal["mealType"];
    const foodId = String(body.foodId || "");
    const portion = (body.portion || "medium") as Meal["portion"];
    const addOns = Array.isArray(body.addOns) ? body.addOns.map(String) : [];

    const food = getFood(foodId);
    if (!food) throw new HttpError(400, "Invalid food.");
    if (!["breakfast", "lunch", "snack", "dinner"].includes(mealType)) {
      throw new HttpError(400, "Invalid meal type.");
    }

    let scoreChange = calcMealScoreChange(foodId, portion, addOns);
    const ts = new Date().toISOString();
    if (isLateNightMeal(ts)) scoreChange -= 5;

    const meal: Meal = {
      id: crypto.randomUUID(),
      date: todayISO(),
      timestamp: ts,
      mealType,
      foodId,
      foodName: food.name,
      portion,
      addOns,
      scoreChange,
    };

    user.meals = [meal, ...user.meals].slice(0, 100);
    user.coins += 5;
    user.todayScore = recomputeTodayScore(user);

    // Streak milestone reward
    const streakBonus = streakMilestoneReward(user.streak);
    if (streakBonus > 0 && !user.badges.includes(`streak-${user.streak}`)) {
      user.coins += streakBonus;
      user.badges.push(`streak-${user.streak}`);
    }

    await setUser(user);

    const { pinHash, ...rest } = user;
    return NextResponse.json({ ok: true, meal, user: rest });
  } catch (e) {
    return errorResponse(e);
  }
}
