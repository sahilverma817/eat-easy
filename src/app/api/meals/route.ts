import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/session";
import { logMealForUser } from "@/lib/meal-log";
import type { Meal } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { meal, user: updated } = await logMealForUser(user, {
      mealType: body.mealType as Meal["mealType"],
      foodId: String(body.foodId || ""),
      portion: (body.portion || "medium") as Meal["portion"],
      addOns: Array.isArray(body.addOns) ? body.addOns.map(String) : [],
    });
    const { pinHash, ...rest } = updated;
    return NextResponse.json({ ok: true, meal, user: rest });
  } catch (e) {
    return errorResponse(e);
  }
}
